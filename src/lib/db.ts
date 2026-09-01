import { Pool } from 'pg';
import { ScanReport } from './types';
import { config } from './config';
import { DEMO_REPORTS } from './demoReports';

let pool: Pool | null = null;
if (config.POSTGRES_URL) {
  try {
    const isLocalhost = config.POSTGRES_URL.includes("localhost") || config.POSTGRES_URL.includes("127.0.0.1");
    pool = new Pool({
      connectionString: config.POSTGRES_URL,
      connectionTimeoutMillis: 5000,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
    });
  } catch (e) {
    console.warn("Failed to initialize PostgreSQL pool, using in-memory store:", e);
  }
}

// In-memory fallback
const mockStore = new Map<string, ScanReport>();

let tableInitialized = false;

async function ensureTable(client: any) {
  if (tableInitialized) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(255) PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  tableInitialized = true;
}

export async function saveReport(report: ScanReport) {
  // Always cache in memory as well
  mockStore.set(report.id, report);

  if (config.isMockMode || !pool) return;
  
  try {
    const client = await pool.connect();
    try {
      await ensureTable(client);
      await client.query(
        'INSERT INTO reports (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
        [report.id, report]
      );
    } finally {
      client.release();
    }
  } catch (e) {
    console.warn("PostgreSQL saveReport error, persisted in memory:", e);
  }
}

export async function getReport(id: string): Promise<ScanReport | null> {
  // 1. Check memory store
  const memoryCached = mockStore.get(id);
  if (memoryCached) {
    return memoryCached;
  }

  // 2. Check predefined demo reports fallback
  if (DEMO_REPORTS[id]) {
    return DEMO_REPORTS[id];
  }

  if (config.isMockMode || !pool) {
    return null;
  }

  try {
    const client = await pool.connect();
    try {
      await ensureTable(client);
      const res = await client.query('SELECT data FROM reports WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        const report = res.rows[0].data as ScanReport;
        mockStore.set(id, report); // Cache for subsequent reads
        return report;
      }
      return null;
    } finally {
      client.release();
    }
  } catch (e) {
    console.warn("PostgreSQL getReport error, falling back to memory store:", e);
    return mockStore.get(id) || null;
  }
}

export async function getAllReports(): Promise<ScanReport[]> {
  const memoryReports = Array.from(mockStore.values());

  if (config.isMockMode || !pool) {
    return memoryReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  try {
    const client = await pool.connect();
    try {
      await ensureTable(client);
      const res = await client.query('SELECT data FROM reports ORDER BY created_at DESC LIMIT 100');
      if (res.rows.length > 0) {
        const dbReports = res.rows.map((r: any) => r.data as ScanReport);
        for (const r of dbReports) {
          mockStore.set(r.id, r);
        }
        return dbReports;
      }
      return memoryReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } finally {
      client.release();
    }
  } catch (e) {
    console.warn("PostgreSQL getAllReports error, using memory store:", e);
    return memoryReports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// -------------------------------------------------------------
// MODEL QUOTA TRACKER (24H COOLDOWN RESETS)
// -------------------------------------------------------------
const memoryQuotaCooldowns = new Map<string, Date>();
let quotaTableInitialized = false;

async function ensureQuotaTable(client: any) {
  if (quotaTableInitialized) return;
  await client.query(`
    CREATE TABLE IF NOT EXISTS model_quotas (
      model_name VARCHAR(100) PRIMARY KEY,
      exhausted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      cooldown_until TIMESTAMP WITH TIME ZONE NOT NULL,
      reason TEXT
    );
  `);
  quotaTableInitialized = true;
}

export async function recordModelQuotaExhausted(
  modelName: string,
  cooldownHours: number = 24,
  reason: string = "QUOTA_EXCEEDED"
) {
  const cooldownUntil = new Date(Date.now() + cooldownHours * 60 * 60 * 1000);
  memoryQuotaCooldowns.set(modelName, cooldownUntil);

  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await ensureQuotaTable(client);
      await client.query(
        `INSERT INTO model_quotas (model_name, exhausted_at, cooldown_until, reason)
         VALUES ($1, CURRENT_TIMESTAMP, $2, $3)
         ON CONFLICT (model_name)
         DO UPDATE SET exhausted_at = CURRENT_TIMESTAMP, cooldown_until = $2, reason = $3`,
        [modelName, cooldownUntil.toISOString(), reason]
      );
      console.log(`[Quota Tracker] Stored ${cooldownHours}h cooldown for ${modelName} until ${cooldownUntil.toISOString()}`);
    } finally {
      client.release();
    }
  } catch (e) {
    console.warn("[Quota Tracker] Failed to save cooldown to DB, cached in memory:", e);
  }
}

export async function getModelCooldowns(): Promise<Map<string, Date>> {
  const activeCooldowns = new Map<string, Date>();
  const now = new Date();

  // 1. Sync from memory cache
  for (const [model, until] of memoryQuotaCooldowns.entries()) {
    if (until > now) {
      activeCooldowns.set(model, until);
    } else {
      memoryQuotaCooldowns.delete(model);
    }
  }

  if (!pool) return activeCooldowns;

  try {
    const client = await pool.connect();
    try {
      await ensureQuotaTable(client);
      const res = await client.query(
        `SELECT model_name, cooldown_until FROM model_quotas WHERE cooldown_until > CURRENT_TIMESTAMP`
      );
      for (const row of res.rows) {
        const until = new Date(row.cooldown_until);
        activeCooldowns.set(row.model_name, until);
        memoryQuotaCooldowns.set(row.model_name, until);
      }
    } finally {
      client.release();
    }
  } catch (e) {
    console.warn("[Quota Tracker] Failed to fetch active cooldowns from DB, using memory store:", e);
  }

  return activeCooldowns;
}

export interface ModelAvailabilityInfo {
  available: string[];
  inCooldown: Array<{
    model: string;
    cooldownUntil: Date;
    remainingHours: number;
  }>;
}

export async function getAvailableGeminiModels(): Promise<ModelAvailabilityInfo> {
  const activeCooldowns = await getModelCooldowns();
  const now = Date.now();
  const available: string[] = [];
  const inCooldown: Array<{ model: string; cooldownUntil: Date; remainingHours: number }> = [];

  for (const model of config.geminiModelsCascade) {
    const cooldownUntil = activeCooldowns.get(model);
    if (cooldownUntil && cooldownUntil.getTime() > now) {
      const remainingHours = Math.max(1, Math.ceil((cooldownUntil.getTime() - now) / (1000 * 60 * 60)));
      inCooldown.push({ model, cooldownUntil, remainingHours });
    } else {
      available.push(model);
    }
  }

  return { available, inCooldown };
}

export async function getEngineStatus() {
  const { available, inCooldown } = await getAvailableGeminiModels();
  const activeCooldownMap = new Map(inCooldown.map((c) => [c.model, c]));

  const cascadeStatus = config.geminiModelsCascade.map((m) => {
    const cooldown = activeCooldownMap.get(m);
    return {
      model: m,
      isReady: !cooldown,
      remainingHours: cooldown ? cooldown.remainingHours : 0,
      cooldownUntil: cooldown ? cooldown.cooldownUntil.toISOString() : null,
    };
  });

  const targetModel = available.length > 0
    ? available[0]
    : (config.DEEPSEEK_API_KEY ? "deepseek-chat" : "none");

  return {
    activeProvider: config.aiProvider,
    targetModel,
    cascadeStatus,
    deepseekAvailable: Boolean(config.DEEPSEEK_API_KEY),
  };
}

