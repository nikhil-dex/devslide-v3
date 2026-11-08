import { NextResponse } from "next/server";
import { searchUnsplashImages } from "@/lib/images/unsplash";

export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  if (!query.trim() || query.length > 120) {
    return NextResponse.json({ error: "Provide an image search query of 1–120 characters." }, { status: 400 });
  }
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return NextResponse.json({ error: "Image search is not configured." }, { status: 503 });
  }
  try {
    const images = await searchUnsplashImages(query, { signal: AbortSignal.timeout(8000) });
    return NextResponse.json({ images }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Image search is temporarily unavailable." }, { status: 502 });
  }
}
