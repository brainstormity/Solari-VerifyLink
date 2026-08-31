export const config = {
  SOLARI_API_KEY: process.env.SOLARI_API_KEY || "",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  POSTGRES_URL: process.env.POSTGRES_URL || "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Mock mode for local dev if keys are missing
  isMockMode: !process.env.SOLARI_API_KEY || !process.env.DEEPSEEK_API_KEY,
};

export function validateConfig() {
  if (config.isMockMode) {
    console.warn("VerifyLink is running in Mock Mode (Missing SOLARI_API_KEY or DEEPSEEK_API_KEY). Real scans will be simulated.");
  }
}
