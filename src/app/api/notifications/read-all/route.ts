import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

// POST /api/notifications/read-all — mark all notifications as read
export async function POST(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();

    const result = await Notification.updateMany(
      { userId: user.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return successResponse(
      { updated: result.modifiedCount },
      `Marked ${result.modifiedCount} notifications as read.`
    );
  } catch (error) {
    console.error("[POST /api/notifications/read-all]", error);
    return errorResponse("Failed to mark notifications as read.", 500);
  }
}
