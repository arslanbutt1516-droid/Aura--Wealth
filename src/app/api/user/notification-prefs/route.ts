import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { updateNotificationPrefsSchema } from "@/lib/validations";
import ActivityLog from "@/models/ActivityLog";

// PATCH /api/user/notification-prefs
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const body = await request.json();

    const result = updateNotificationPrefsSchema.safeParse(body);
    if (!result.success) {
      const firstError =
        Object.values(result.error.flatten().fieldErrors)[0]?.[0] ||
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const prefs = result.data;

    // Build update object for nested notificationPreferences
    const updateObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(prefs)) {
      if (value !== undefined) {
        updateObj[`notificationPreferences.${key}`] = value;
      }
    }

    const user = await User.findByIdAndUpdate(
      jwtUser.userId,
      { $set: updateObj },
      { new: true }
    ).lean();

    if (!user) return errorResponse("User not found.", 404);

    await ActivityLog.create({
      userId: jwtUser.userId,
      type: "profile_updated",
      description: "Notification preferences updated",
      metadata: { updated: Object.keys(prefs) },
    });

    return successResponse(
      { notificationPreferences: user.notificationPreferences },
      "Notification preferences saved."
    );
  } catch (error) {
    console.error("[PATCH /api/user/notification-prefs]", error);
    return errorResponse("Failed to save notification preferences.", 500);
  }
}
