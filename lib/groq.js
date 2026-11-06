export async function sendRequestToGroq(prompt, { apiKey, model, signal, json = false }) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    signal,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 4096,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!response.ok) {
    // Do not relay upstream response bodies, which can echo request data.
    const message = response.status === 429
      ? "Groq's usage limit was reached. Wait and try again, or choose another provider."
      : response.status === 401 || response.status === 403
        ? "Groq rejected the API key. Check your Groq key and model permissions."
        : response.status === 404
          ? "This Groq model is unavailable for your account. Choose another model."
          : "Groq could not complete this request. Try a shorter presentation or another model.";
    throw Object.assign(new Error(message), { status: response.status === 429 ? 429 : 502 });
  }
  const result = await response.json();
  const choice = result.choices?.[0];
  if (choice?.finish_reason === "length") {
    throw Object.assign(new Error("Groq reached its output limit. Ask for fewer slides or a smaller edit."), { status: 502 });
  }
  return {
    text: typeof choice?.message?.content === "string" ? choice.message.content.trim() : "",
    blockReason: choice?.finish_reason === "content_filter" ? "content_filter" : null,
  };
}
