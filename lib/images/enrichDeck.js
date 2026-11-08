import { searchUnsplashImages } from "./unsplash.js";

// Enrich only slides that explicitly use the image component. Never do
// network I/O in compileDeck: it must remain pure and deterministic.
export async function enrichDeckImages(source, { search = searchUnsplashImages } = {}) {
  if (!source || !Array.isArray(source.slides)) return source;
  const slides = await Promise.all(source.slides.map(async (slide) => {
    if (slide?.component?.toLowerCase() !== "image" || !slide.props) return slide;
    const props = slide.props;
    const query = [props.title, props.caption, props.image]
      .filter((value) => typeof value === "string" && value.trim())
      .join(" ").slice(0, 120);
    if (!query) return slide;
    try {
      const results = await search(query, { perPage: 3 });
      const photo = results[0];
      if (photo?.url) {
        return {
          ...slide,
          props: {
            ...props,
            image: photo.url,
            caption: props.caption || photo.description || "Photograph",
          },
          imageCredit: {
            id: photo.id,
            photographer: photo.photographer,
            photographerUrl: photo.photographerUrl,
            unsplashUrl: photo.unsplashUrl,
            downloadLocation: photo.downloadLocation,
          },
        };
      }
    } catch (error) {
      console.warn("[deck-images] Unsplash enrichment unavailable:", error?.message);
    }
    // A missing provider must not break an otherwise valid generation.
    // Replace the unresolved image slide with a textual fallback.
    return {
      component: "callout",
      props: {
        title: typeof props.title === "string" && props.title.trim() ? props.title : "Visual insight",
        body: typeof props.caption === "string" && props.caption.trim()
          ? props.caption
          : "An illustrative image is unavailable for this slide.",
      },
    };
  }));
  return { ...source, slides };
}
