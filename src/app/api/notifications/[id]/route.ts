import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/notifications/:id — mark as read
export async function PATCH(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    ).lean();

    if (!notification) return errorResponse("Notification not found.", 404);

    return successResponse({ id: notification._id.toString(), isRead: true }, "Notification marked as read.");
  } catch (error) {
    console.error("[PATCH /api/notifications/:id]", error);
    return errorResponse("Failed to update notification.", 500);
  }
}

// DELETE /api/notifications/:id — delete a notification
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!notification) return errorResponse("Notification not found.", 404);

    return successResponse(null, "Notification deleted.");
  } catch (error) {
    console.error("[DELETE /api/notifications/:id]", error);
    return errorResponse("Failed to delete notification.", 500);
  }
}
