// Shared Gemini API client used by generate-ppt and edit-slide.

export function toErrorMessage(error) {
  if (!error) return "Something went wrong.";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message || "Something went wrong.";
  if (typeof error === "object" && error.message) return String(error.message);
  try {
    return JSON.stringify(error);
  } catch {
    return "Something went wrong.";
  }
}

function formatGeminiApiError(status, model, errorBody) {
  try {
    const parsed = JSON.parse(errorBody);
    const apiMessage = parsed?.error?.message;
    if (apiMessage) {
      return `Gemini API error (${status}) for model "${model}": ${apiMessage}`;
    }
  } catch {
    // errorBody is plain text
  }

  return `Gemini API error (${status}) for model "${model}": ${errorBody}`;
}

const DEPRECATED_GEMINI_MODELS = new Set([
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-preview-09-25",
  "gemini-2.5-flash-preview-05-20",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  // 2.5 generation: retired for new API keys mid-2026 ("no longer available
  // to new users") — grandfathered keys still work, new/BYOK keys get 404.
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
]);

function resolveGeminiModel() {
  const configuredModel = process.env.GEMINI_MODEL?.trim();
  const defaultModel = "gemini-3.6-flash";

  if (!configuredModel) {
    return defaultModel;
  }

  if (DEPRECATED_GEMINI_MODELS.has(configuredModel)) {
    console.warn(
      `GEMINI_MODEL "${configuredModel}" is retired. Falling back to ${defaultModel}.`
    );
    return defaultModel;
  }

  return configuredModel;
}

// Explicitly configured fallbacks avoid silently switching users to a paid model.
// Example: GEMINI_FALLBACK_MODELS=gemini-3-flash-preview,gemini-2.5-flash
function modelCandidates() {
  const primary = resolveGeminiModel();
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter((model) => model && !DEPRECATED_GEMINI_MODELS.has(model));
  return [...new Set([primary, ...fallbacks])];
}

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const FALLBACK_STATUS = new Set([404, 429, 500, 502, 503, 504]);

export async function sendRequestToGemini(prompt, { apiKey: apiKeyOverride } = {}) {
  const apiKey = (apiKeyOverride || process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Add it in your environment variables.");
  }

  const payload = { contents: [{ parts: [{ text: prompt }] }] };
  const candidates = modelCandidates();
  let lastError;

  for (const [index, model] of candidates.entries()) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    console.log("[gemini] attempting model:", model);
    let shouldFallback = false;

    for (let attempt = 0; attempt < 3; attempt++) {
      let response;
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        lastError = new Error(toErrorMessage(error));
        shouldFallback = true;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
          continue;
        }
        break;
      }

      if (response.ok) return response.json();

      const errorBody = await response.text();
      lastError = new Error(formatGeminiApiError(response.status, model, errorBody));

      // Invalid keys, malformed requests, and safety errors must not be
      // disguised by trying other models.
      if (!RETRYABLE_STATUS.has(response.status) && !FALLBACK_STATUS.has(response.status)) {
        throw lastError;
      }

      shouldFallback = FALLBACK_STATUS.has(response.status);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** attempt));
    }

    if (!shouldFallback || index === candidates.length - 1) break;
    console.warn(`[gemini] ${model} unavailable; trying configured fallback`);
  }

  throw lastError || new Error("No Gemini model was available.");
}

// If the model returned nothing because content safety refused the request,
// tell the caller so users get "blocked" instead of a generic failure.
const SAFETY_FINISH_REASONS = new Set([
  "SAFETY",
  "PROHIBITED_CONTENT",
  "BLOCKLIST",
  "SPII",
  "IMAGE_SAFETY",
]);

export function geminiBlockReason(result) {
  if (result?.promptFeedback?.blockReason) {
    return result.promptFeedback.blockReason;
  }
  const finish = result?.candidates?.[0]?.finishReason;
  if (finish && SAFETY_FINISH_REASONS.has(finish)) {
    return finish;
  }
  return null;
}

// Join all text parts of a Gemini response into one trimmed string.
export function geminiText(result) {
  return (
    result?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      ?.join("")
      ?.trim() || ""
  );
}
