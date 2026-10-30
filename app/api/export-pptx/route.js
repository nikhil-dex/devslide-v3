import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { compileDeck } from "@/deck/compile.js";
import { renderDeckToPptx } from "@/lib/pptxExport";
import {
  storeExportArtifact,
  ExportStorageNotConfiguredError,
} from "@/lib/exportStorage";

// PPTX export.
//
// Accepts either already-compiled slides (what the export screen holds) or a
// deck source, which is handed to the EXISTING compiler. No compilation logic
// is duplicated here — this route only validates, delegates and streams bytes.
//
// Chromium needs the Node runtime; it can never run on the edge.
export const runtime = "nodejs";
export const maxDuration = 300;

// Same bounds the save endpoint enforces, so a deck that can be stored can
// always be exported and vice versa.
const MAX_SLIDES = 50;
const MAX_SLIDE_LENGTH = 200_000;

// The artifact is NOT returned in the response. Vercel Functions cap a
// response body at 4.5 MB and a PPTX exceeds that at roughly 2 slides (~1.7 MB
// per slide), so the bytes go to Blob storage and the client downloads them
// directly. A JSON response is also invisible to download managers, which is
// what broke the previous binary response.
const PPTX_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

function safeFilename(title) {
  const base = String(title ?? "")
    // Control characters would corrupt the Content-Disposition header.
    .replace(/[\u0000-\u001f\u007f]/g, "")
    // Characters that are illegal in filenames on common platforms.
    .replace(/["\\/:*?<>|]/g, "")
    .trim()
    .slice(0, 80);
  return base || "presentation";
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Sign in to export presentations." }, { status: 401 });
    }

    // Rendering launches a browser — meter it as tightly as the PDF export.
    const rl = rateLimit(`export-pptx:${session.user.email}`, { limit: 5 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSeconds);

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { title, slides, source } = body ?? {};
    let compiledSlides;

    if (Array.isArray(slides)) {
      // Already-compiled slides straight from the editor/export screen.
      if (
        slides.length === 0 ||
        slides.length > MAX_SLIDES ||
        !slides.every((s) => typeof s === "string" && s.length <= MAX_SLIDE_LENGTH)
      ) {
        return Response.json({ error: "Invalid slides data." }, { status: 400 });
      }
      compiledSlides = slides;
    } else if (source && typeof source === "object") {
      // Deck source — compiled by the one and only compiler.
      const compiled = compileDeck(source);
      if (!compiled.valid) {
        return Response.json(
          { error: `Invalid deck: ${compiled.errors.join("; ")}` },
          { status: 400 }
        );
      }
      compiledSlides = compiled.slides;
    } else {
      return Response.json(
        { error: "Provide either compiled slides or a deck source." },
        { status: 400 }
      );
    }

    const pptx = await renderDeckToPptx(compiledSlides);
    const filename = `${safeFilename(title)}.pptx`;

    const artifact = await storeExportArtifact({
      bytes: pptx,
      filename,
      contentType: PPTX_CONTENT_TYPE,
      identity: session.user.email,
    });

    return Response.json(
      {
        success: true,
        url: artifact.url,
        filename: artifact.filename,
        size: artifact.size,
        expiresAt: artifact.expiresAt,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    // Internal detail stays in the server log; the client gets a stable message.
    console.error("[export-pptx] render failed:", error);

    // A missing Blob store is an operator mistake, not a user one.
    if (error instanceof ExportStorageNotConfiguredError) {
      return Response.json(
        { error: "Export storage is not configured on this deployment." },
        { status: 503 }
      );
    }

    return Response.json(
      { error: "Could not generate the PowerPoint file. Please try again." },
      { status: 500 }
    );
  }
}
