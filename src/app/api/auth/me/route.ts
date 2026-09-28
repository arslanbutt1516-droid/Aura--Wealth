import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import User from "@/models/User";
import dbConnect from "@/lib/db";

export async function GET() {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) {
      return errorResponse("Not authenticated.", 401);
    }

    await dbConnect();
    const user = await User.findById(jwtUser.userId).lean();
    if (!user) {
      return errorResponse("User not found.", 404);
    }

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
    console.error("[GET /api/auth/me]", error);
    return errorResponse("Failed to fetch user.", 500);
  }
}
