import { Solari, BrowserSession } from "@solarisdk/browser";
import { chromium } from "playwright";
import { config } from "./config";
import { SolariApiError } from "./types";

export async function inspectUrlWithSolari(targetUrl: string) {
  if (config.isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      finalUrl: targetUrl,
      title: "Mock Title - Secure Store",
      redirects: [],
      screenshotBase64: "",
      domExcerpt: {
        forms: [],
        bodyText: "Welcome to the secure store.",
        externalScriptCount: 0,
      },
      latencyMs: 1500,
      networkDetails: {
        server: "mock-server",
        ip: "104.26.12.31",
        sslIssuer: "Mock Security Authority",
        sslProtocol: "TLS 1.3",
        sslValid: true,
      },
    };
  }

  // Normalize target URL
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const solari = new Solari({ apiKey: config.SOLARI_API_KEY });
  let sessionId: string | null = null;
  let browser: any = null;
  const startTime = Date.now();

  try {
    // 1. Explicitly acquire session ID first
    let rawSession: any;
    try {
      rawSession = await solari.sessions.create({ stealth: true, captcha: true });
      sessionId = rawSession.id;
    } catch (sessionErr: any) {
      console.error("Solari session creation failed:", sessionErr);
      const msg = (sessionErr?.message || "").toLowerCase();
      const status = sessionErr?.status || sessionErr?.statusCode;
      if (status === 401 || msg.includes("unauthorized") || msg.includes("api key")) {
        throw new SolariApiError("Invalid Solari API Key. Please verify SOLARI_API_KEY in .env.", 401);
      }
      if (status === 402 || status === 429 || msg.includes("quota") || msg.includes("limit") || msg.includes("credit")) {
        throw new SolariApiError("Solari API quota or credit limit reached. Please check your Solari account.", status || 429);
      }
      throw new SolariApiError(`Solari Cloud Browser session error: ${sessionErr?.message || "Failed to initialize"}`, status);
    }

    // 2. Connect Playwright over the session's WebSocket
    browser = await chromium.connect(rawSession.wsEndpoint);
    const sessionWrapper = new BrowserSession(solari, rawSession, browser);

    const context = sessionWrapper.contexts()[0] || await sessionWrapper.newContext();
    const page = context.pages()[0] || await context.newPage();

    // Set strict per-operation timeouts (8s max) to prevent any hang
    page.setDefaultTimeout(8000);
    page.setDefaultNavigationTimeout(8000);

    const redirects: string[] = [];
    page.on("response", (res: any) => {
      try {
        if ([301, 302, 307, 308].includes(res.status())) {
          redirects.push(res.url());
        }
      } catch (e) {}
    });

    let response: any = null;
    try {
      response = await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 8000 });
    } catch (navErr: any) {
      console.warn(`Navigation to ${normalizedUrl} ended early (${navErr?.name || "Timeout"}): Target server unresponsive or hanging.`);
      try {
        if (!page.isClosed()) {
          await page.evaluate(() => window.stop()).catch(() => {});
        }
      } catch (e) {}
    }
    
    let finalUrl = normalizedUrl;
    let title = "";
    try {
      if (!page.isClosed()) {
        const pageUrl = page.url();
        if (pageUrl && pageUrl !== "about:blank" && !pageUrl.startsWith("data:")) {
          finalUrl = pageUrl;
        }
        title = await page.title().catch(() => "");
      }
    } catch (e) {}

    // Extract network & SSL telemetry from Chromium
    let serverHeader = "";
    let serverIp = "";
    let sslIssuer = "";
    let sslProtocol = "";
    let sslValid = false;

    if (response) {
      try {
        const headers = response.headers();
        serverHeader = headers["server"] || "";
      } catch (e) {}

      try {
        const sAddr = await response.serverAddr();
        if (sAddr?.ipAddress) {
          serverIp = sAddr.ipAddress;
        }
      } catch (e) {}

      try {
        const sec = await response.securityDetails();
        if (sec) {
          sslIssuer = sec.issuer() || "";
          sslProtocol = sec.protocol() || "";
          const validTo = sec.validTo();
          sslValid = validTo ? validTo * 1000 > Date.now() : true;
        }
      } catch (e) {}
    }
    
    // Screenshot with tight 3s timeout
    let screenshotBase64 = "";
    try {
      if (!page.isClosed()) {
        const screenshot = await page.screenshot({ type: "jpeg", quality: 75, fullPage: false, timeout: 3000 });
        screenshotBase64 = screenshot.toString("base64");
      }
    } catch (e: any) {
      console.warn("Screenshot capture skipped:", e?.message || e);
    }
    
    // Extract DOM with cross-domain form analysis and script inspection
    let domExcerpt: {
      forms: Array<{ action: string; method: string; inputs: Array<{ name: string; type: string }>; isCrossDomain?: boolean }>;
      bodyText: string;
      externalScriptCount: number;
    } = { forms: [], bodyText: "", externalScriptCount: 0 };

    try {
      if (!page.isClosed()) {
        domExcerpt = await Promise.race([
          page.evaluate(() => {
            const currentHost = window.location.hostname;
            const forms = Array.from(document.querySelectorAll("form")).map(f => {
              let isCross = false;
              try {
                if (f.action) {
                  const actUrl = new URL(f.action, window.location.href);
                  isCross = actUrl.hostname !== currentHost;
                }
              } catch (e) {}
              return {
                action: f.action || "",
                method: (f.method || "GET").toUpperCase(),
                inputs: Array.from(f.querySelectorAll("input")).map(i => ({ name: i.name || i.id || "", type: i.type || "text" })),
                isCrossDomain: isCross,
              };
            });
            const bodyText = document.body ? document.body.innerText.slice(0, 3000) : "";
            const externalScriptCount = document.querySelectorAll("script[src]").length;
            return { forms, bodyText, externalScriptCount };
          }),
          new Promise<{ forms: any[]; bodyText: string; externalScriptCount: number }>((_, reject) =>
            setTimeout(() => reject(new Error("DOM eval timeout")), 2500)
          )
        ]);
      }
    } catch (e: any) {
      console.warn("DOM extraction skipped:", e?.message || e);
    }

    const latencyMs = Date.now() - startTime;

    return {
      finalUrl,
      title,
      redirects,
      screenshotBase64,
      domExcerpt,
      latencyMs,
      networkDetails: {
        server: serverHeader,
        ip: serverIp,
        sslIssuer,
        sslProtocol,
        sslValid,
      },
    };
  } catch (error: any) {
    if (error instanceof SolariApiError || error?.name === "SolariApiError") {
      throw error;
    }
    console.error("Browser inspection encountered error, returning safe baseline:", error?.message || error);
    return {
      finalUrl: normalizedUrl,
      title: "Host Unreachable / Connection Dropped",
      redirects: [],
      screenshotBase64: "",
      domExcerpt: {
        forms: [],
        bodyText: `Target host connection failed or dropped during zero-trust inspection: ${error?.message || "Timeout"}`,
        externalScriptCount: 0,
      },
      latencyMs: Date.now() - startTime,
      networkDetails: {
        server: "",
        ip: "",
        sslIssuer: "",
        sslProtocol: "",
        sslValid: false,
      },
    };
  } finally {
    // ----------------------------------------------------
    // BULLETPROOF IMMEDIATE TEARDOWN PIPELINE
    // ----------------------------------------------------
    if (browser) {
      try {
        await browser.close().catch(() => {});
      } catch (e) {}
    }

    if (sessionId) {
      const activeId = sessionId;
      // 1. SDK releaseAndWait
      try {
        await solari.sessions.releaseAndWait(activeId).catch(() => {});
      } catch (e) {}

      // 2. Direct Fallback HTTP DELETE to Solari Gateway to guarantee cloud termination
      try {
        await fetch(`https://api.getsolari.com/sessions/${encodeURIComponent(activeId)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${config.SOLARI_API_KEY}`,
          },
        }).catch(() => {});
      } catch (e) {}
    }

    try {
      await solari.close().catch(() => {});
    } catch (e) {}
  }
}
