import { Solari, BrowserSession } from "@solarisdk/browser";
import { chromium } from "patchright-core";
import { config } from "./config";

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
      },
      latencyMs: 1500,
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

  // Global safety watchdog timer to prevent hangs
  const scanPromise = (async () => {
    // 1. Explicitly acquire session ID first so we have the handle immediately
    const rawSession = await solari.sessions.create({ stealth: true, captcha: true });
    sessionId = rawSession.id;

    // 2. Connect Playwright over the session's WebSocket
    browser = await chromium.connect(rawSession.wsEndpoint);
    const sessionWrapper = new BrowserSession(solari, rawSession, browser);

    const context = sessionWrapper.contexts()[0] || await sessionWrapper.newContext();
    const page = await context.newPage();

    const redirects: string[] = [];
    page.on("response", (res: any) => {
      if ([301, 302, 307, 308].includes(res.status())) {
        redirects.push(res.url());
      }
    });

    const startTime = Date.now();
    try {
      await page.goto(normalizedUrl, { waitUntil: "domcontentloaded", timeout: 12000 });
    } catch (navErr) {
      console.warn(`Navigation warning on ${normalizedUrl}:`, navErr);
    }
    
    let finalUrl = normalizedUrl;
    let title = "";
    try {
      finalUrl = page.url() || normalizedUrl;
      title = await page.title();
    } catch (e) {}
    
    // Screenshot
    let screenshotBase64 = "";
    try {
      const screenshot = await page.screenshot({ type: "jpeg", quality: 75, fullPage: false });
      screenshotBase64 = screenshot.toString("base64");
    } catch (e) {
      console.warn("Screenshot capture warning:", e);
    }
    
    // Extract DOM
    let domExcerpt: {
      forms: Array<{ action: string; method: string; inputs: Array<{ name: string; type: string }> }>;
      bodyText: string;
    } = { forms: [], bodyText: "" };
    try {
      domExcerpt = await page.evaluate(() => {
        const forms = Array.from(document.querySelectorAll("form")).map(f => ({
          action: f.action,
          method: f.method,
          inputs: Array.from(f.querySelectorAll("input")).map(i => ({ name: i.name, type: i.type }))
        }));
        const bodyText = document.body ? document.body.innerText.slice(0, 3000) : "";
        return { forms, bodyText };
      });
    } catch (e) {
      console.warn("DOM extraction warning:", e);
    }

    const latencyMs = Date.now() - startTime;

    return {
      finalUrl,
      title,
      redirects,
      screenshotBase64,
      domExcerpt,
      latencyMs
    };
  })();

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Solari Browser inspection timed out after 22s")), 22000);
  });

  try {
    return await Promise.race([scanPromise, timeoutPromise]);
  } finally {
    // ----------------------------------------------------
    // BULLETPROOF SESSION TEARDOWN & REAPING PIPELINE
    // ----------------------------------------------------
    if (browser) {
      try {
        await browser.close().catch(() => {});
      } catch (e) {}
    }

    if (sessionId) {
      const activeId = sessionId;
      // 1. Call SDK releaseAndWait
      try {
        await solari.sessions.releaseAndWait(activeId).catch(() => {});
      } catch (e) {}

      // 2. Direct Fallback HTTP DELETE to Solari Gateway to guarantee termination
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
