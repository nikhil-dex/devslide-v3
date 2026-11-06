// Bring-your-own-key (client side). The key lives ONLY in this browser's
// localStorage and is sent per request as a header — never stored on the
// server. With a user key present, AI calls don't consume credits.
export const BYOK_STORAGE_KEY = "pptGeminiKey";
export const BYOK_STORAGE_KEYS = { gemini: BYOK_STORAGE_KEY, groq: "pptGroqKey" };

export function getByokKey(provider = "gemini") {
  if (typeof window === "undefined") return "";
  if (!Object.hasOwn(BYOK_STORAGE_KEYS, provider)) return "";
  try {
    return window.localStorage.getItem(BYOK_STORAGE_KEYS[provider]) || "";
  } catch {
    return "";
  }
}

export function byokHeaders(provider = "gemini") {
  const key = getByokKey(provider);
  return key ? { [provider === "groq" ? "x-groq-key" : "x-gemini-key"]: key } : {};
}
