import { getAppUrl } from "@/lib/appUrl";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

import Ppts from "@/models/Ppts";
import User from "@/models/User";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: "Sign in to generate a share link." },
        { status: 401 }
      );
    }

    const rl = rateLimit(`public:${session.user.email}`, { limit: 30 });
    if (!rl.ok) {
      return rateLimitResponse(rl.retryAfterSeconds);
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404 }
      );
    }

    await dbConnect();
    const origin = getAppUrl(req);
    const user = await User.findOne({
      email: session.user.email,
    }).select("_id");

    if (!user) {
      return Response.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    const ppt = await Ppts.findById(id).select(
      "userid shareToken visibility"
    );

    if (!ppt) {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404 }
      );
    }

    if (String(ppt.userid) !== String(user._id)) {
      return Response.json(
        { error: "You can only share your own presentations." },
        { status: 403 }
      );
    }


    // Public links are stable.
// Once generated we reuse the same token until the user explicitly regenerates it.
    if (ppt.shareToken) {
      

     return Response.json({
        success: true,
        id: String(ppt._id),
        visibility: ppt.visibility,
        shareToken: ppt.shareToken,
        shareUrl: `${origin}/present/${ppt.shareToken}`,
        generated: false,
        });
    }

    // Generate a collision-safe token.
    let token;

    do {
      token = nanoid(24);
    } while (
      await Ppts.exists({
        shareToken: token,
      })
    );
    ppt.shareToken = token;
    ppt.visibility = "public";

    await ppt.save();

   

    return Response.json({
          success: true,
          id: String(ppt._id),
          visibility: ppt.visibility,
          shareToken: ppt.shareToken,
          shareUrl: `${origin}/present/${ppt.shareToken}`,
          generated: true,
        });
  } catch (error) {
    console.error("Public share error:", error);

    return Response.json(
      {
        error: error.message || "Something went wrong.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    
    const rl = rateLimit(`public:${session.user.email}`, {
  limit: 30,
});

if (!rl.ok) {
  return rateLimitResponse(
    rl.retryAfterSeconds
  );
}
await dbConnect();

    

    
    const ppt = await Ppts.findById(id);

    if (!ppt) {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404 }
      );
    }

 const user = await User.findOne({
  email: session.user.email,
}).select("_id");

if (!user) {
  return Response.json(
    { error: "User not found." },
    { status: 404 }
  );
}

if (String(ppt.userid) !== String(user._id)) {
  return Response.json(
    { error: "You can only regenerate your own presentations." },
    { status: 403 }
  );
}

    let token;

    do {
      token = nanoid(24);
    } while (
      await Ppts.exists({
        shareToken: token,
      })
    );

    ppt.shareToken = token;
    ppt.visibility = "public";

    await ppt.save();

    return Response.json({
      success: true,
      shareToken: token,
      url: `${getAppUrl(req)}/present/${token}`,
    });
  } catch (error) {
    console.error("PATCH public link error:", error);

    return Response.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}


export async function DELETE(req, { params }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const rl = rateLimit(
      `public:${session.user.email}`,
      { limit: 30 }
    );

    if (!rl.ok) {
      return rateLimitResponse(
        rl.retryAfterSeconds
      );
    }

    await dbConnect();

    const user = await User.findOne({
      email: session.user.email,
    }).select("_id");

    const ppt = await Ppts.findById(id);

    if (!ppt) {
      return Response.json(
        { error: "Presentation not found." },
        { status: 404 }
      );
    }

    if (String(ppt.userid) !== String(user._id)) {
      return Response.json(
        {
          error:
            "You can only disable your own presentations.",
        },
        { status: 403 }
      );
    }

    ppt.visibility = "private";
    ppt.shareToken = null;

    await ppt.save();

    return Response.json({
      success: true,
      message:
        "Public link disabled.",
    });
  } catch (error) {
    console.error(
      "DELETE public link error:",
      error
    );

    return Response.json(
      {
        error:
          error.message ||
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}