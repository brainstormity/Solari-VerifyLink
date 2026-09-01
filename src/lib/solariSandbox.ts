import { SandboxClient } from "@solarisdk/sandbox";
import { config } from "./config";
import { SolariApiError } from "./types";

function calculateDomainAge(dateStr: string): string {
  try {
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return "";
    const diffMs = Date.now() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "";
    if (diffDays < 30) return `Created ${diffDays} day${diffDays === 1 ? '' : 's'} ago (Very New)`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `Created ${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} year${diffYears === 1 ? '' : 's'} old (${created.getFullYear()})`;
  } catch (e) {
    return "";
  }
}

function parseWhoisMetadata(whoisText: string) {
  let registrar = "";
  let creationDate = "";

  const regMatch = whoisText.match(/Registrar:\s*([^\r\n]+)/i) || whoisText.match(/registrar name:\s*([^\r\n]+)/i);
  if (regMatch) registrar = regMatch[1].trim();

  const dateMatch = whoisText.match(/Creation Date:\s*([^\r\n]+)/i) || whoisText.match(/created:\s*([^\r\n]+)/i) || whoisText.match(/registered on:\s*([^\r\n]+)/i);
  if (dateMatch) {
    creationDate = dateMatch[1].trim();
  }

  return {
    registrar,
    creationDate,
    domainAge: creationDate ? calculateDomainAge(creationDate) : "",
  };
}

export async function runSandboxForensics(domain: string) {
  if (config.isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      dns: JSON.stringify({ address: "104.26.12.31", err: null }),
      whois: "Creation Date: 2024-01-01T00:00:00Z\nRegistrar: NAMECHEAP INC\nExpiry: 2025-01-01T00:00:00Z",
      resolvedIp: "104.26.12.31",
      registrar: "NAMECHEAP INC",
      creationDate: "2024-01-01T00:00:00Z",
      domainAge: "1 year old (2024)",
    };
  }

  const sandboxClient = new SandboxClient({ apiKey: config.SOLARI_API_KEY, baseUrl: "https://api.getsolari.com" });
  let sandboxId: string | null = null;
  let sandbox: any = null;

  const sandboxPromise = (async () => {
    // 1. Create sandbox with short server-side TTL timeout and explicit kill lifecycle
    try {
      sandbox = await sandboxClient.create({
        template: "base",
        timeoutMs: 15000,
        lifecycle: { onTimeout: "kill", autoResume: false },
      } as any);
      sandboxId = sandbox.sandboxId || sandbox.id || sandbox.session?.id || null;
    } catch (sandboxErr: any) {
      console.error("Solari Sandbox VM creation failed:", sandboxErr);
      const msg = (sandboxErr?.message || "").toLowerCase();
      const status = sandboxErr?.status || sandboxErr?.statusCode;
      if (status === 401 || msg.includes("unauthorized") || msg.includes("api key")) {
        throw new SolariApiError("Invalid Solari API Key. Please verify SOLARI_API_KEY in .env.", 401);
      }
      if (status === 402 || status === 429 || msg.includes("quota") || msg.includes("limit") || msg.includes("credit")) {
        throw new SolariApiError("Solari Sandbox quota or credit limit reached. Please check your Solari account.", status || 429);
      }
      throw new SolariApiError(`Solari Sandbox VM error: ${sandboxErr?.message || "Failed to initialize"}`, status);
    }

    // 2. Run isolated DNS and WHOIS commands with per-command bounds
    let dnsOutput = "";
    let whoisOutput = "";

    try {
      const dnsResult = await Promise.race([
        sandbox.commands.run(`node -e "
          const dns = require('dns');
          dns.lookup('${domain}', (err, address) => console.log(JSON.stringify({ address, err })));
        "`),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("DNS command timed out")), 5000))
      ]);
      dnsOutput = (dnsResult as any)?.stdout || (dnsResult as any)?.stderr || "";
    } catch (e: any) {
      dnsOutput = `DNS check error: ${e?.message || e}`;
    }

    try {
      const whoisResult = await Promise.race([
        sandbox.commands.run(`whois ${domain} | grep -E -i "Creation Date|Registrar|Expiry" | head -n 5`),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error("WHOIS command timed out")), 5000))
      ]);
      whoisOutput = (whoisResult as any)?.stdout || (whoisResult as any)?.stderr || "";
    } catch (e: any) {
      whoisOutput = `WHOIS check error: ${e?.message || e}`;
    }

    const whoisMeta = parseWhoisMetadata(whoisOutput);
    let resolvedIp = "";
    try {
      const parsedDns = JSON.parse(dnsOutput);
      if (parsedDns && parsedDns.address) resolvedIp = parsedDns.address;
    } catch (e) {
      const match = dnsOutput.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      if (match) resolvedIp = match[0];
    }

    return {
      dns: dnsOutput,
      whois: whoisOutput,
      resolvedIp,
      registrar: whoisMeta.registrar,
      creationDate: whoisMeta.creationDate,
      domainAge: whoisMeta.domainAge,
    };
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Sandbox forensics timed out after 15s")), 15000);
  });

  try {
    return await Promise.race([sandboxPromise, timeoutPromise]);
  } finally {
    // ----------------------------------------------------
    // BULLETPROOF SANDBOX MICROVM DESTRUCTION PIPELINE
    // ----------------------------------------------------
    if (sandbox) {
      try {
        if (typeof sandbox.kill === 'function') {
          await sandbox.kill().catch(() => {});
        }
      } catch (e) {}
    }

    const activeId = sandboxId || sandbox?.sandboxId || sandbox?.id;
    if (activeId) {
      // 1. SDK kill
      try {
        await sandboxClient.kill(activeId).catch(() => {});
      } catch (e) {}

      // 2. Direct Fallback HTTP DELETE to Solari Gateway
      try {
        await fetch(`https://api.getsolari.com/sandboxes/${encodeURIComponent(activeId)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${config.SOLARI_API_KEY}`,
          },
        }).catch(() => {});
      } catch (e) {}
    }
  }
}
