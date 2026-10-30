import bcrypt from "bcryptjs";

import { dbConnect } from "@/lib/mongodb";
import Ppts from "@/models/Ppts";

export async function POST(
  req,
  { params }
) {
  try {
    const { token } = await params;

    const { password } =
      await req.json();

    await dbConnect();

    const ppt = await Ppts.findOne({
      shareToken: token,
      visibility: "public",
    }).select("passwordHash");

    if (!ppt) {
      return Response.json(
        {
          error:
            "Presentation not found.",
        },
        { status: 404 }
      );
    }

    if (!ppt.passwordHash) {
      return Response.json({
        success: true,
        authenticated: true,
      });
    }

    const valid =
      await bcrypt.compare(
        password,
        ppt.passwordHash
      );

    if (!valid) {
      return Response.json(
        {
          success: false,
          authenticated: false,
          error:
            "Incorrect password.",
        },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      authenticated: true,
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