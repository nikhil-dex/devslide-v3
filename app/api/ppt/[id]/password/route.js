import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { dbConnect } from "@/lib/mongodb";

import Ppts from "@/models/Ppts";
import User from "@/models/User";

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

    const { password } = await req.json();

    if (!password || password.length < 4) {
      return Response.json(
        {
          error:
            "Password must be at least 4 characters.",
        },
        { status: 400 }
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
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10
    );

    ppt.passwordHash = passwordHash;

    await ppt.save();

    return Response.json({
      success: true,
      message:
        "Password protection enabled.",
    });
  } catch (error) {
    console.error(error);

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
        { error: "Forbidden." },
        { status: 403 }
      );
    }

    ppt.passwordHash = null;

    await ppt.save();

    return Response.json({
      success: true,
      message:
        "Password protection removed.",
    });
  } catch (error) {
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