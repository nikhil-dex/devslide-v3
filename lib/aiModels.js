// Curated text-generation models, verified against provider docs on 2026-11-04.
// This shared allowlist keeps UI choices and server validation in sync.
export const AI_PROVIDERS = {
  gemini: {
    label: "Google Gemini",
    models: [
      { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
      { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash" },
      { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
    ],
  },
  groq: {
    label: "Groq",
    models: [
      { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B · Fast" },
      { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B · Higher capacity" },
    ],
  },
};

export const DEFAULT_AI_SELECTION = { provider: "gemini", model: "gemini-3.6-flash" };

export function resolveAiSelection({ provider = "gemini", model } = {}) {
  if (typeof provider !== "string" || !Object.hasOwn(AI_PROVIDERS, provider)) {
    throw Object.assign(new Error("Choose a supported AI provider."), { status: 400 });
  }
  const models = AI_PROVIDERS[provider].models;
  const selected = model === undefined ? models[0].id : model;
  if (!models.some((item) => item.id === selected)) {
    throw Object.assign(new Error("Choose a supported model for this provider."), { status: 400 });
  }
  return { provider, model: selected };
}
