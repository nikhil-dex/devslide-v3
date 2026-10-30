export function readStoredSlides(readValue) {
  try {
    const raw = readValue();
    if (typeof raw !== "string" || raw.length === 0) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((slide) => typeof slide === "string");
  } catch {
    // Storage may be unavailable, malformed, or contain an invalid payload.
    return [];
  }
}
