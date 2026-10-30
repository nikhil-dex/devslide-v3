import { dbConnect } from "@/lib/mongodb";
import Ppts from "@/models/Ppts";

export async function GET(req, { params }) {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string") {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404 }
      );
    }

    await dbConnect();

    const ppt = await Ppts.findOneAndUpdate(
  {
    shareToken: token,
    visibility: "public",
  },
  {
    $inc: {
      viewCount: 1,
    },
  },
  {
    new: true,
  }
)
.select(
  "titles ppt_History createdAt shareToken viewCount passwordHash"
)
.lean();

    if (!ppt) {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404 }
      );
    }

    // Older documents stored slides wrapped in an extra array:
    // [[slide1, slide2, ...]]
    let slides = ppt.ppt_History || [];

    if (
      slides.length === 1 &&
      Array.isArray(slides[0])
    ) {
      slides = slides[0];
    }

return Response.json(
{
    success: true,
    id: String(ppt._id),
    title: ppt.titles,
    slides,
    createdAt: ppt.createdAt,
    shareToken: ppt.shareToken,
    requiresPassword: !!ppt.passwordHash,
},
  { 
    // Public presentations change infrequently.
// Cache for 60 seconds and allow stale content while revalidating.
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  }
);
  } catch (error) {
    console.error("Public presentation error:", error);

    return Response.json(
      {
        error: error.message || "Something went wrong.",
      },
      { status: 500 }
    );
  }
}