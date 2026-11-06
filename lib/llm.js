// Single seam for AI text generation. API routes call llmComplete and never
// talk to a provider directly — adding another provider (OpenAI, Ollama,
// OpenRouter...) means extending this file, not touching the routes.
import { sendRequestToGemini, geminiText, geminiBlockReason } from "./gemini";
import { sendRequestToGroq } from "./groq";
import { resolveAiSelection } from "./aiModels";

export async function llmComplete(prompt, { apiKey, provider, model, signal, json = false } = {}) {
  const selection = resolveAiSelection({ provider, model });
  const deadline = AbortSignal.timeout(60_000);
  const combined = signal ? AbortSignal.any([signal, deadline]) : deadline;
  try {
    combined.throwIfAborted();
    if (selection.provider === "groq") {
      return await sendRequestToGroq(prompt, {
        apiKey, model: selection.model, signal: combined, json,
      });
    }
    const result = await sendRequestToGemini(prompt, {
      apiKey, model: selection.model, signal: combined,
    });
    return { text: geminiText(result), blockReason: geminiBlockReason(result) };
  } catch (error) {
    if (combined.aborted) {
      throw Object.assign(new Error(signal?.aborted
        ? "Generation was cancelled."
        : "The model took too long. Try again or choose another model. Your credit was not used."),
      { status: signal?.aborted ? 499 : 504 });
    }
    throw error;
  }
}
