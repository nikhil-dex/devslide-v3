import { resolveAiSelection } from "./aiModels";

// Resolve credentials BEFORE reserving credits. Never forward another
// provider's key or fall back across providers.
export function getAiRequestOptions(req, body) {
  const selection = resolveAiSelection(body);
  const { provider } = selection;
  const userKey = req.headers.get(provider === "groq" ? "x-groq-key" : "x-gemini-key")?.trim() || "";
  const platformKey = provider === "groq" ? process.env.GROQ_API_KEY : process.env.GEMINI_API_KEY;
  const apiKey = userKey || platformKey?.trim();
  if (!apiKey) {
    throw Object.assign(new Error(`${provider === "groq" ? "Groq" : "Gemini"} is not configured. Add your provider API key in Profile or ask the administrator to configure it.`), { status: 503 });
  }
  return {
    ...selection,
    apiKey,
    usingByok: Boolean(userKey),
    // Groq is the no-app-credit option; provider account quotas still apply.
    chargeCredits: provider === "gemini" && !userKey,
    signal: req.signal,
  };
}
