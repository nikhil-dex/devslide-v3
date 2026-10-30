import { dbConnect } from "@/lib/mongodb";
import Ppts from "@/models/Ppts";

export async function GET(req, { params }) {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string") {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    await dbConnect();

    const ppt = await Ppts.findOneAndUpdate(
      {
        shareToken: token,
        visibility: "public",
      },
      {
        $inc: { viewCount: 1 },
      },
      { new: true }
    )
      .select("titles ppt_History createdAt shareToken passwordHash")
      .lean();

    if (!ppt) {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const requiresPassword = Boolean(ppt.passwordHash);
    let slides = [];

    // Never return protected slide content from the unauthenticated endpoint.
    if (!requiresPassword) {
      slides = ppt.ppt_History || [];
      if (slides.length === 1 && Array.isArray(slides[0])) {
        slides = slides[0];
      }
    }

    return Response.json(
      {
        success: true,
        id: String(ppt._id),
        title: ppt.titles,
        slides,
        createdAt: ppt.createdAt,
        shareToken: ppt.shareToken,
        requiresPassword,
      },
      {
        headers: {
          // Password-protected responses must never be cached by shared caches.
          "Cache-Control": requiresPassword
            ? "private, no-store"
            : "public, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Public presentation error:", error);

    return Response.json(
      { error: "Could not load presentation." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
