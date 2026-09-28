import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;

    // Mark all if id === "all"
    if (id === "all") {
      await Notification.updateMany(
        { userId: user.userId, isRead: false },
        { isRead: true }
      );
      return successResponse(null, "All notifications marked as read.");
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { isRead: true },
      { new: true }
    ).lean();

    if (!notification) return errorResponse("Notification not found.", 404);

    return successResponse({ id: notification._id.toString(), isRead: true });
  } catch (error) {
    console.error("[PATCH /api/notifications/:id/read]", error);
    return errorResponse("Failed to update notification.", 500);
  }
}
