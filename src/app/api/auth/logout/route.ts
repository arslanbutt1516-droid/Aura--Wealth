import { clearAuthCookie, getCurrentUser } from "@/lib/auth";
import { successResponse } from "@/lib/api-helpers";
import ActivityLog from "@/models/ActivityLog";
import dbConnect from "@/lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await dbConnect();
      await ActivityLog.create({
        userId: user.userId,
        type: "logout",
        description: "User logged out",
        metadata: {},
      });
    }
    await clearAuthCookie();
    return successResponse(null, "Logged out successfully.");
  } catch {
    await clearAuthCookie();
    return successResponse(null, "Logged out.");
  }
}
