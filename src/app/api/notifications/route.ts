import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

// GET /api/notifications
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";

    const filter: Record<string, unknown> = { userId: user.userId };
    if (unreadOnly) filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: user.userId,
      isRead: false,
    });

    return successResponse({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        channel: n.channel,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("[GET /api/notifications]", error);
    return errorResponse("Failed to fetch notifications.", 500);
  }
}
