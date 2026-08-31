import { NextRequest, NextResponse } from 'next/server';
import { inspectUrlWithSolari } from '@/lib/solariBrowser';
import { runSandboxForensics } from '@/lib/solariSandbox';
import { analyzeThreat } from '@/lib/analyzer';
import { saveReport } from '@/lib/db';
import { ScanReport } from '@/lib/types';
import { DEMO_URL_MAP, DEMO_REPORTS } from '@/lib/demoReports';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { url, demoId } = await req.json();
    if (!url && !demoId) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const trimmedUrl = (url || "").trim();

    // 0. Check if this is an instant Predefined Demo (Preserves API/AI quotas)
    const matchingDemoId = demoId || DEMO_URL_MAP[trimmedUrl] || (trimmedUrl.endsWith('/') ? DEMO_URL_MAP[trimmedUrl.slice(0, -1)] : null);
    
    if (matchingDemoId && DEMO_REPORTS[matchingDemoId]) {
      // Save to user's history so it appears in My Reports because they scanned it
      const report = {
        ...DEMO_REPORTS[matchingDemoId],
        timestamp: new Date().toISOString(),
      };
      await saveReport(report);

      // Simulate realistic microVM + LLM inspection process timing (~4s) without calling external APIs
      await new Promise((resolve) => setTimeout(resolve, 4000));
      return NextResponse.json({ id: matchingDemoId });
    }

    const t0 = Date.now();
    const id = randomUUID();

    // 1. Browser Inspection (Playwright over Solari Cloud Browser)
    const browserResult = await inspectUrlWithSolari(trimmedUrl);
    
    // Extract domain from final URL for WHOIS/DNS
    let domain = trimmedUrl;
    try {
      domain = new URL(browserResult.finalUrl).hostname;
    } catch(e) {}

    // 2. Sandbox Forensics (DNS/WHOIS via Solari Sandbox MicroVM)
    const sandboxResult = await runSandboxForensics(domain);

    // 3. DeepSeek V4 Threat Analysis
    const analysis = await analyzeThreat(
      domain,
      browserResult.finalUrl,
      browserResult.redirects,
      browserResult.domExcerpt,
      sandboxResult.dns,
      sandboxResult.whois
    );

    const t1 = Date.now();

    // 4. Construct Report
    const report: ScanReport = {
      id,
      targetUrl: trimmedUrl,
      finalUrl: browserResult.finalUrl,
      domain,
      timestamp: new Date().toISOString(),
      overallScore: analysis.overallScore,
      riskLevel: analysis.riskLevel,
      summary: analysis.summary,
      redFlags: analysis.redFlags,
      pillars: analysis.pillars,
      redirectCount: browserResult.redirects.length,
      screenshotBase64: browserResult.screenshotBase64,
      metrics: {
        browserLatencyMs: browserResult.latencyMs,
        totalScanTimeMs: t1 - t0,
      }
    };

    // 5. Store in DB/Cache
    await saveReport(report);

    return NextResponse.json({ id });
  } catch (error: any) {
    console.error("Scan Error:", error);
    return NextResponse.json({ error: error.message || "Failed to scan URL" }, { status: 500 });
  }
}
