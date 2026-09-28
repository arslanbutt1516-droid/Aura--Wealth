import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { updateProfileSchema } from "@/lib/validations";
import ActivityLog from "@/models/ActivityLog";

// GET /api/user/profile
export async function GET(): Promise<NextResponse> {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const user = await User.findById(jwtUser.userId).lean();
    if (!user) return errorResponse("User not found.", 404);

    return successResponse({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      whatsappNumber: user.whatsappNumber,
      preferredCurrency: user.preferredCurrency,
      favoriteCurrencies: user.favoriteCurrencies,
      notificationPreferences: user.notificationPreferences,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    console.error("[GET /api/user/profile]", error);
    return errorResponse("Failed to fetch profile.", 500);
  }
}

// PATCH /api/user/profile
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const body = await request.json();

    const result = updateProfileSchema.safeParse(body);
    if (!result.success) {
      const firstError =
        Object.values(result.error.flatten().fieldErrors)[0]?.[0] ||
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const updates = result.data;
    const user = await User.findByIdAndUpdate(
      jwtUser.userId,
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) return errorResponse("User not found.", 404);

    await ActivityLog.create({
      userId: jwtUser.userId,
      type: "profile_updated",
      description: "Profile updated",
      metadata: { fields: Object.keys(updates) },
    });

    return successResponse(
      {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        whatsappNumber: user.whatsappNumber,
        preferredCurrency: user.preferredCurrency,
        favoriteCurrencies: user.favoriteCurrencies,
      },
      "Profile updated successfully."
    );
  } catch (error) {
    console.error("[PATCH /api/user/profile]", error);
    return errorResponse("Failed to update profile.", 500);
  }
}
