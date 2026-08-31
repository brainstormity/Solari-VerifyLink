export type RiskLevel = "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "CRITICAL";

export interface SecurityPillarResult {
  name: string;
  status: "pass" | "warning" | "fail";
  score: number; // 0 to 25
  details: string;
}

export interface ScanReport {
  id: string;
  targetUrl: string;
  finalUrl: string;
  domain: string;
  timestamp: string;
  overallScore: number; // 0 to 100
  riskLevel: RiskLevel;
  summary: string;
  redFlags: string[];
  pillars: {
    domainLegitimacy: SecurityPillarResult;
    brandSafety: SecurityPillarResult;
    paymentSecurity: SecurityPillarResult;
    uxPatterns: SecurityPillarResult;
  };
  redirectCount: number;
  screenshotBase64: string;
  metrics: {
    browserLatencyMs: number;
    totalScanTimeMs: number;
  };
}
