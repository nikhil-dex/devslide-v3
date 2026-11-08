// Server-only Unsplash search. Never expose the access key to the browser.
// Keep provider calls outside the deterministic deck compiler.
const API = "https://api.unsplash.com";
const MAX_QUERY_LENGTH = 120;

export async function searchUnsplashImages(query, { perPage = 6, signal } = {}) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error("Unsplash is not configured (UNSPLASH_ACCESS_KEY).");
  if (typeof query !== "string" || !query.trim() || query.length > MAX_QUERY_LENGTH) {
    throw new Error("Image query must contain 1–120 characters.");
  }
  const count = Math.max(1, Math.min(12, Number.isFinite(perPage) ? Math.floor(perPage) : 6));
  const url = new URL("/search/photos", API);
  url.searchParams.set("query", query.trim());
  url.searchParams.set("per_page", String(count));
  url.searchParams.set("orientation", "landscape");

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${key}`,
      "Accept-Version": "v1",
    },
    signal,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Unsplash search failed (${response.status}).`);
  }
  const data = await response.json();
  return (Array.isArray(data.results) ? data.results : []).map((photo) => ({
    id: photo.id,
    description: photo.alt_description || photo.description || query.trim(),
    width: photo.width,
    height: photo.height,
    url: photo.urls?.regular,
    thumb: photo.urls?.small,
    photographer: photo.user?.name || "Unknown",
    photographerUrl: photo.user?.links?.html || null,
    unsplashUrl: photo.links?.html || null,
    downloadLocation: photo.links?.download_location || null,
  })).filter((photo) => photo.id && photo.url);
}
