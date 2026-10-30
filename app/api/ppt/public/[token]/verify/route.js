import bcrypt from "bcryptjs";

import { dbConnect } from "@/lib/mongodb";
import Ppts from "@/models/Ppts";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req, { params }) {
  try {
    const { token } = await params;

    if (typeof token !== "string" || !token) {
      return Response.json({ error: "Presentation not found." }, { status: 404 });
    }

    const rl = rateLimit(`public-password:${token}`, { limit: 10, windowMs: 60_000 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSeconds);

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const password = typeof body?.password === "string" ? body.password : "";
    if (!password || password.length > 256) {
      return Response.json({ error: "Enter a valid password." }, { status: 400 });
    }

    await dbConnect();

    const ppt = await Ppts.findOne({
      shareToken: token,
      visibility: "public",
    }).select("passwordHash titles ppt_History createdAt _id").lean();

    if (!ppt) {
      return Response.json({ error: "Presentation not found." }, { status: 404 });
    }

    if (!ppt.passwordHash) {
      return Response.json(
        { error: "This presentation does not require a password." },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(password, ppt.passwordHash);
    if (!valid) {
      return Response.json(
        { success: false, authenticated: false, error: "Incorrect password." },
        { status: 401 }
      );
    }

    let slides = ppt.ppt_History || [];
    if (slides.length === 1 && Array.isArray(slides[0])) {
      slides = slides[0];
    }

    // Return protected content only after the password has been verified.
    return Response.json(
      {
        success: true,
        authenticated: true,
        id: String(ppt._id),
        title: ppt.titles,
        slides,
        createdAt: ppt.createdAt,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Password verification error:", error);
    return Response.json(
      { error: "Could not verify presentation password." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
