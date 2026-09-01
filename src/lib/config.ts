function sanitizeKey(val?: string) {
  if (!val) return "";
  // Strip any inline comments (e.g. #PAID or #FREE) and surrounding whitespace
  return val.split("#")[0].trim();
}

const solariKey = sanitizeKey(process.env.SOLARI_API_KEY);
const geminiKey = sanitizeKey(process.env.GEMINI_API_KEY);
const deepseekKey = sanitizeKey(process.env.DEEPSEEK_API_KEY);

// If both are put, use gemini by default; otherwise use whichever is provided
const activeAiProvider: "gemini" | "deepseek" | "none" = geminiKey
  ? "gemini"
  : deepseekKey
  ? "deepseek"
  : "none";

export const config = {
  SOLARI_API_KEY: solariKey,
  GEMINI_API_KEY: geminiKey,
  DEEPSEEK_API_KEY: deepseekKey,
  aiProvider: activeAiProvider,
  geminiModel: "gemini-3.7-flash",
  geminiModelsCascade: [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
  ],
  deepseekModel: "deepseek-chat",
  POSTGRES_URL: (process.env.POSTGRES_URL || "").trim(),
  NEXT_PUBLIC_APP_URL: (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").trim(),
  // Mock mode for local dev if Solari key is missing or neither AI key is provided
  isMockMode: !solariKey || activeAiProvider === "none",
};



export function validateConfig() {
  if (config.isMockMode) {
    console.warn("VerifyLink is running in Mock Mode (Missing SOLARI_API_KEY or neither GEMINI_API_KEY nor DEEPSEEK_API_KEY provided). Real scans will be simulated.");
  } else {
    console.log(`VerifyLink AI Engine active: ${config.aiProvider.toUpperCase()} (${config.aiProvider === 'gemini' ? config.geminiModel : config.deepseekModel})`);
  }
}

