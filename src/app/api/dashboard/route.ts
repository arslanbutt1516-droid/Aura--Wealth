import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import PrizeBond from "@/models/PrizeBond";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";
import Draw from "@/models/Draw";
import User from "@/models/User";
import { getLiveRates } from "@/services/currencyService";

export async function GET(): Promise<NextResponse> {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) {
      return errorResponse("Unauthorized.", 401);
    }

    await dbConnect();
    const userId = jwtUser.userId;

    // Parallel queries — currency gets a 5s timeout so it never blocks dashboard
    const currencyTimeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000)
    );

    const [user, bonds, notifications, recentActivity, upcomingDraw, rates] =
      await Promise.all([
        User.findById(userId).select("name email preferredCurrency role").lean(),
        PrizeBond.find({ userId }).select("denomination status lastResult lastChecked").lean(),
        Notification.find({ userId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select("type title message isRead createdAt")
          .lean(),
        ActivityLog.find({ userId })
          .sort({ createdAt: -1 })
          .limit(8)
          .select("type description createdAt")
          .lean(),
        Draw.findOne({ status: "upcoming" })
          .sort({ drawDate: 1 })
          .select("denomination drawNumber drawDate location")
          .lean(),
        Promise.race([getLiveRates("USD").catch(() => null), currencyTimeout]),
      ]);


    if (!user) {
      return errorResponse("User not found.", 404);
    }

    // Portfolio calculations
    const activeBonds = bonds.filter((b) => b.status === "active");
    const totalBondValue = activeBonds.reduce(
      (sum, b) => sum + b.denomination,
      0
    );
    const winningBonds = bonds.filter((b) => b.lastResult?.isWinner === true);
    const totalWinnings = winningBonds.reduce(
      (sum, b) => sum + (b.lastResult?.prizeAmount || 0),
      0
    );
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Currency overview
    const pkrRate = rates?.rates?.["PKR"] || null;
    const usdRate = rates?.rates?.["USD"] || null;
    const eurRate = rates?.rates?.["EUR"] || null;

    // Summary by denomination
    const bondsByDenomination: Record<number, number> = {};
    for (const bond of activeBonds) {
      bondsByDenomination[bond.denomination] =
        (bondsByDenomination[bond.denomination] || 0) + 1;
    }

    return successResponse({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
        role: user.role,
      },
      bondSummary: {
        totalBonds: activeBonds.length,
        totalBondValue,
        winningBonds: winningBonds.length,
        totalWinnings,
        bondsByDenomination,
        lastChecked: bonds.reduce((latest, b) => {
          if (!b.lastChecked) return latest;
          if (!latest) return b.lastChecked;
          return new Date(b.lastChecked) > new Date(latest) ? b.lastChecked : latest;
        }, null as Date | null),
      },
      currencyOverview: {
        pkrPerUsd: pkrRate || null,
        eurPerUsd: eurRate || null,
        usdRate: usdRate || null,
        lastUpdated: rates?.timestamp || null,
        source: rates?.source || null,
        isCached: rates?.isCached || false,
      },
      upcomingDraw: upcomingDraw
        ? {
            id: upcomingDraw._id.toString(),
            denomination: upcomingDraw.denomination,
            drawNumber: upcomingDraw.drawNumber,
            drawDate: upcomingDraw.drawDate,
            location: upcomingDraw.location,
          }
        : null,
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
      unreadNotifications: unreadCount,
      recentActivity: recentActivity.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        description: a.description,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return errorResponse("Failed to load dashboard data.", 500);
  }
}
