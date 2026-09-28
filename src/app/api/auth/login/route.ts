import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import ActivityLog from "@/models/ActivityLog";
import { signToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { email, password } = result.data;

    // Find user with passwordHash
    const user = await User.findOne({ email }).select("+passwordHash").lean();
    if (!user) {
      console.log("Login failed: User not found for email:", email);
      // Generic message to prevent email enumeration
      return errorResponse("Invalid email or password.", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash as string);
    if (!isPasswordValid) {
      console.log("Login failed: Password mismatch for email:", email);
      return errorResponse("Invalid email or password.", 401);
    }

    // Update lastLogin
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Activity log
    await ActivityLog.create({
      userId: user._id,
      type: "login",
      description: `User logged in`,
      metadata: { email },
    });

    // Create JWT and set cookie
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = successResponse(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          preferredCurrency: user.preferredCurrency,
        },
      },
      "Logged in successfully!"
    );

    await setAuthCookie(token);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return errorResponse("Login failed. Please try again.", 500);
  }
}
