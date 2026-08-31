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
