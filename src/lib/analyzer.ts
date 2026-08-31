import OpenAI from 'openai';
import { z } from 'zod';
import { config } from './config';
import { RiskLevel, SecurityPillarResult } from './types';

// Zod Schema for the expected output
const PillarSchema = z.object({
  name: z.string(),
  status: z.enum(["pass", "warning", "fail"]),
  score: z.number().min(0).max(25),
  details: z.string(),
});

const AnalysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  riskLevel: z.enum(["SAFE", "SUSPICIOUS", "DANGEROUS", "CRITICAL"]),
  summary: z.string(),
  redFlags: z.array(z.string()),
  pillars: z.object({
    domainLegitimacy: PillarSchema,
    brandSafety: PillarSchema,
    paymentSecurity: PillarSchema,
    uxPatterns: PillarSchema,
  }),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export async function analyzeThreat(
  domain: string,
  finalUrl: string,
  redirects: string[],
  domExcerpt: any,
  dnsInfo: string,
  whoisInfo: string
): Promise<AnalysisResult> {
  if (config.isMockMode) {
    // Return mock data
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      overallScore: 18,
      riskLevel: "CRITICAL",
      summary: "High risk of phishing and deceptive checkout practices detected.",
      redFlags: [
        "Unencrypted checkout form detected",
        "Domain age is very young (under 30 days)",
        "Brand impersonation attempt suspected",
      ],
      pillars: {
        domainLegitimacy: { name: "Domain Legitimacy", status: "fail", score: 5, details: "Domain created recently, lacks established reputation." },
        brandSafety: { name: "Brand Safety", status: "fail", score: 2, details: "Suspicious typosquatting on known brand." },
        paymentSecurity: { name: "Payment Security", status: "fail", score: 1, details: "Payment form is not using secure iframes from known providers." },
        uxPatterns: { name: "UX Patterns", status: "warning", score: 10, details: "Uses aggressive popups and fake urgency timers." },
      },
    };
  }

  const openai = new OpenAI({
    apiKey: config.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  const promptContext = `
    Analyze the following website for phishing, scams, and deceptive practices.
    
    Target Domain: ${domain}
    Final URL after redirects: ${finalUrl}
    Redirect Chain: ${redirects.join(" -> ")}
    
    DNS Info:
    ${dnsInfo}
    
    WHOIS Info:
    ${whoisInfo}
    
    DOM Excerpt:
    ${JSON.stringify(domExcerpt, null, 2)}
    
    Assess the site strictly on 4 pillars:
    1. Domain Legitimacy (score 0-25)
    2. Brand Safety (score 0-25)
    3. Payment Security (score 0-25)
    4. UX Patterns (score 0-25)
    
    Output JSON exactly matching this structure, with no extra text:
    {
      "overallScore": number (0-100),
      "riskLevel": "SAFE" | "SUSPICIOUS" | "DANGEROUS" | "CRITICAL",
      "summary": "String",
      "redFlags": ["String"],
      "pillars": {
        "domainLegitimacy": { "name": "Domain Legitimacy", "status": "pass" | "warning" | "fail", "score": number, "details": "String" },
        "brandSafety": { "name": "Brand Safety", "status": "pass" | "warning" | "fail", "score": number, "details": "String" },
        "paymentSecurity": { "name": "Payment Security", "status": "pass" | "warning" | "fail", "score": number, "details": "String" },
        "uxPatterns": { "name": "UX Patterns", "status": "pass" | "warning" | "fail", "score": number, "details": "String" }
      }
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: 'You are an elite cybersecurity analyst AI. You strictly return valid JSON that conforms to the required schema.' },
      { role: 'user', content: promptContext }
    ],
    response_format: { type: 'json_object' },
  });

  let resultString = response.choices[0].message.content || "{}";
  // Strip markdown code fences if present
  resultString = resultString.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(resultString);
    return AnalysisResultSchema.parse(parsed);
  } catch (err) {
    console.error("Failed to parse LLM output:", err, resultString);
    throw new Error("Invalid output from LLM analysis.");
  }
}
