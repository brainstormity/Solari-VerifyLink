import { SandboxClient } from "@solarisdk/sandbox";
import { config } from "./config";

export async function runSandboxForensics(domain: string) {
  if (config.isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      dns: JSON.stringify({ address: "192.168.1.1", err: null }),
      whois: "Creation Date: 2024-01-01T00:00:00Z\nRegistrar: NAMECHEAP INC\nExpiry: 2025-01-01T00:00:00Z",
    };
  }

  const sandboxClient = new SandboxClient({ apiKey: config.SOLARI_API_KEY, baseUrl: "https://api.getsolari.com" });
  let sandboxId: string | null = null;
  let sandbox: any = null;

  const sandboxPromise = (async () => {
    // 1. Create sandbox with short server-side TTL timeout
    sandbox = await sandboxClient.create({ template: "base", timeoutMs: 30000 } as any);
    sandboxId = sandbox.id;

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

    return {
      dns: dnsOutput,
      whois: whoisOutput
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

    if (sandboxId) {
      const activeId = sandboxId;
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
