import OpenAI from 'openai';
import { z } from 'zod';
import { config } from './config';
import { RiskLevel, SecurityPillarResult, ThreatAnalysisApiError } from './types';
import { getAvailableGeminiModels, recordModelQuotaExhausted } from './db';

export function formatModelName(model: string): string {
  if (model.includes("3.7")) return "Gemini 3.7 Flash";
  if (model.includes("3.6")) return "Gemini 3.6 Flash";
  if (model.includes("3.5")) return "Gemini 3.5 Flash";
  if (model.includes("deepseek")) return "DeepSeek V4";
  return model;
}

export interface StatusCallbackEvent {
  type: "step" | "model_evaluating" | "model_switched" | "quota_cooldown_skip";
  model?: string;
  previousModel?: string;
  message: string;
  remainingHours?: number;
}


const PillarSchema = z.object({
  name: z.string(),
  status: z.enum(["pass", "warning", "fail"]),
  score: z.number().min(0).max(25),
  details: z.string(),
});

const SecurityAdviceSchema = z.object({
  verdict: z.string(),
  actionItems: z.array(z.string()),
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
  securityAdvice: SecurityAdviceSchema.optional(),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

function handleDeepSeekError(apiErr: any): never {
  const status = apiErr?.status || apiErr?.statusCode;
  const msg = (apiErr?.message || "").toLowerCase();
  if (status === 402 || msg.includes("insufficient balance") || msg.includes("balance") || msg.includes("quota") || msg.includes("payment")) {
    throw new ThreatAnalysisApiError(
      "DeepSeek API Error: Insufficient account balance/credits. Please top up your DeepSeek balance or switch to Gemini in .env.",
      "deepseek",
      402
    );
  }
  if (status === 401 || msg.includes("api_key") || msg.includes("unauthorized") || msg.includes("authentication")) {
    throw new ThreatAnalysisApiError(
      "Invalid DeepSeek API key. Please check your DEEPSEEK_API_KEY in .env.",
      "deepseek",
      401
    );
  }
  throw new ThreatAnalysisApiError(
    `DeepSeek API Error (${config.deepseekModel}): ${apiErr?.message || "Request failed"}`,
    "deepseek",
    status
  );
}

async function executeDeepSeek(
  promptContext: string,
  onStatusUpdate?: (event: StatusCallbackEvent) => void
): Promise<{ resultString: string; activeModelUsed: string }> {
  if (!config.DEEPSEEK_API_KEY) {
    throw new ThreatAnalysisApiError("DEEPSEEK_API_KEY not configured.", "deepseek", 401);
  }

  onStatusUpdate?.({
    type: "model_evaluating",
    model: "DeepSeek V4",
    message: "Analyzing threats with DeepSeek V4...",
  });

  const deepseekClient = new OpenAI({
    apiKey: config.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });

  const response = await deepseekClient.chat.completions.create({
    model: config.deepseekModel,
    messages: [
      { role: 'system', content: 'You are an elite cybersecurity analyst AI. You strictly return valid JSON that conforms to the required schema.' },
      { role: 'user', content: promptContext }
    ],
    response_format: { type: 'json_object' },
  }, { timeout: 15000 });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new ThreatAnalysisApiError("Empty response from DeepSeek API.", "deepseek", 500);
  }
  return { resultString: content, activeModelUsed: "DeepSeek V4" };
}

async function executeGeminiCascade(
  promptContext: string,
  onStatusUpdate?: (event: StatusCallbackEvent) => void,
  cascadeNotes: string[] = []
): Promise<{ resultString: string; activeModelUsed: string } | null> {
  if (!config.GEMINI_API_KEY) return null;

  const geminiClient = new OpenAI({
    apiKey: config.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  const { available, inCooldown } = await getAvailableGeminiModels();

  for (const c of inCooldown) {
    const skipNote = `Bypassed ${formatModelName(c.model)} (24h daily quota cooldown active, resets in ${c.remainingHours}h)`;
    cascadeNotes.push(skipNote);
    console.log(`[AI Engine] ${skipNote}`);
    onStatusUpdate?.({
      type: "quota_cooldown_skip",
      model: c.model,
      message: skipNote,
      remainingHours: c.remainingHours,
    });
  }

  for (let i = 0; i < available.length; i++) {
    const model = available[i];
    const modelLabel = formatModelName(model);

    try {
      console.log(`[AI Engine] Evaluating with ${modelLabel}...`);
      onStatusUpdate?.({
        type: "model_evaluating",
        model,
        message: `Analyzing threats with ${modelLabel}...`,
      });

      const response = await geminiClient.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are an elite cybersecurity analyst AI. You strictly return valid JSON that conforms to the required schema.' },
          { role: 'user', content: promptContext }
        ],
        response_format: { type: 'json_object' },
      }, { timeout: 9000 });

      const content = response.choices?.[0]?.message?.content;
      if (content) {
        console.log(`[AI Engine] Analysis successfully generated with ${modelLabel}!`);
        return { resultString: content, activeModelUsed: modelLabel };
      }
    } catch (err: any) {
      const status = err?.status || err?.statusCode;
      const msg = (err?.message || "").toLowerCase();
      console.warn(`[AI Engine] ${model} failed (status: ${status || 'timeout'} - ${err?.message || ''})`);

      if (status === 429 || msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("rate limit") || err?.name === 'APIConnectionTimeoutError' || msg.includes('timeout')) {
        await recordModelQuotaExhausted(model, 24, "Daily quota / rate limit exhausted");
        const nextTarget = available[i + 1] ? formatModelName(available[i + 1]) : (config.DEEPSEEK_API_KEY ? "DeepSeek V4" : "None");
        const switchMsg = `${modelLabel} quota reached (24h cooldown active). Auto-switching to ${nextTarget}...`;
        cascadeNotes.push(switchMsg);

        onStatusUpdate?.({
          type: "model_switched",
          previousModel: model,
          model: available[i + 1] || "deepseek-chat",
          message: switchMsg,
        });
      }

      if (status === 401 || status === 403 || msg.includes("api_key") || msg.includes("unauthorized") || msg.includes("permission_denied")) {
        console.warn("[AI Engine] Gemini API key unauthorized, terminating Gemini cascade.");
        break;
      }
    }
  }

  return null;
}

export async function analyzeThreat(
  domain: string,
  finalUrl: string,
  redirects: string[],
  domExcerpt: any,
  dnsInfo: string,
  whoisInfo: string,
  onStatusUpdate?: (event: StatusCallbackEvent) => void,
  preferredProvider?: "deepseek" | "gemini"
): Promise<AnalysisResult & { analyzedBy: string; cascadeNotes: string[] }> {
  if (config.isMockMode || config.aiProvider === "none") {
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
      securityAdvice: {
        verdict: "DO NOT ENTER PASSWORDS OR PAYMENT DETAILS",
        actionItems: [
          "Do not submit any login credentials or credit card numbers on this site.",
          "If you entered any account information, immediately change your password on the genuine platform.",
          "If you submitted payment details, contact your bank or credit card issuer immediately to block unauthorized charges.",
        ],
      },
      analyzedBy: "Mock Simulation Engine",
      cascadeNotes: ["Mock mode active (simulation)"],
    };
  }

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
      },
      "securityAdvice": {
        "verdict": "Clear direct verdict (e.g. SAFE TO PROCEED, EXERCISE EXTREME CAUTION, DO NOT SUBMIT PASSWORDS OR PAYMENT DETAILS)",
        "actionItems": [
          "Actionable recommendation 1",
          "Actionable recommendation 2",
          "Actionable recommendation 3"
        ]
      }
    }
  `;

  let resultString: string | null = null;
  let activeModelUsed = "";
  const cascadeNotes: string[] = [];

  const primaryProvider = preferredProvider || config.aiProvider;

  // 1. DeepSeek-first path (Default if both keys are present, or if preferred by user)
  if (primaryProvider === "deepseek" && config.DEEPSEEK_API_KEY) {
    try {
      const dsRes = await executeDeepSeek(promptContext, onStatusUpdate);
      resultString = dsRes.resultString;
      activeModelUsed = dsRes.activeModelUsed;
    } catch (dsErr: any) {
      if (config.GEMINI_API_KEY) {
        const failoverMsg = `DeepSeek failed (${dsErr?.message || "Credit/Balance Limit"}). Failing over to Gemini cascade...`;
        console.warn(`[AI Engine] ${failoverMsg}`);
        cascadeNotes.push(failoverMsg);

        onStatusUpdate?.({
          type: "model_switched",
          previousModel: "DeepSeek V4",
          model: "Gemini Cascade",
          message: failoverMsg,
        });

        const geminiRes = await executeGeminiCascade(promptContext, onStatusUpdate, cascadeNotes);
        if (geminiRes) {
          resultString = geminiRes.resultString;
          activeModelUsed = `${geminiRes.activeModelUsed} (Failover from DeepSeek)`;
        } else {
          handleDeepSeekError(dsErr);
        }
      } else {
        handleDeepSeekError(dsErr);
      }
    }
  } else if (config.GEMINI_API_KEY) {
    // 2. Gemini-first path (If preferred by user, or if only Gemini is configured)
    const geminiRes = await executeGeminiCascade(promptContext, onStatusUpdate, cascadeNotes);
    if (geminiRes) {
      resultString = geminiRes.resultString;
      activeModelUsed = geminiRes.activeModelUsed;
    } else if (config.DEEPSEEK_API_KEY) {
      const failoverMsg = `All Gemini models in 24h quota cooldown. Seamlessly failing over to DeepSeek V4...`;
      console.log(`[AI Engine] ${failoverMsg}`);
      cascadeNotes.push(failoverMsg);

      onStatusUpdate?.({
        type: "model_switched",
        previousModel: "Gemini",
        model: "DeepSeek V4",
        message: failoverMsg,
      });

      try {
        const dsRes = await executeDeepSeek(promptContext, onStatusUpdate);
        resultString = dsRes.resultString;
        activeModelUsed = "DeepSeek V4 (Failover from Gemini)";
      } catch (dsErr) {
        handleDeepSeekError(dsErr);
      }
    } else {
      throw new ThreatAnalysisApiError(
        "All Gemini models (3.7 Flash, 3.6 Flash, 3.5 Flash) reached daily quota/rate limits (24h cooldown active). Add DEEPSEEK_API_KEY in .env to enable automatic failover.",
        "gemini",
        429
      );
    }
  } else if (config.DEEPSEEK_API_KEY) {
    // 3. Only DeepSeek is available
    try {
      const dsRes = await executeDeepSeek(promptContext, onStatusUpdate);
      resultString = dsRes.resultString;
      activeModelUsed = dsRes.activeModelUsed;
    } catch (dsErr) {
      handleDeepSeekError(dsErr);
    }
  }

  if (!resultString) {
    throw new ThreatAnalysisApiError("No threat analysis response generated.", config.aiProvider, 500);
  }

  // Strip markdown code fences if present
  resultString = resultString.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    const parsed = JSON.parse(resultString);
    const validated = AnalysisResultSchema.parse(parsed);
    return {
      ...validated,
      analyzedBy: activeModelUsed || "AI Threat Engine",
      cascadeNotes,
    };
  } catch (err) {
    console.error("Failed to parse LLM output:", err, resultString);
    throw new ThreatAnalysisApiError(
      `Invalid output format returned by AI Engine (${activeModelUsed || config.aiProvider}).`,
      config.aiProvider,
      500
    );
  }
}

