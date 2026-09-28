import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import PrizeBond from "@/models/PrizeBond";
import ActivityLog from "@/models/ActivityLog";
import { getLiveRates } from "@/services/currencyService";

export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const userId = user.userId;

    const [bonds, recentActivity, rates] = await Promise.all([
      PrizeBond.find({ userId }).lean(),
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).limit(30).lean(),
      getLiveRates("USD").catch(() => null),
    ]);

    // Bond analytics
    const activeBonds = bonds.filter((b) => b.status === "active");
    const totalValue = activeBonds.reduce((s, b) => s + b.denomination, 0);
    const winners = bonds.filter((b) => b.lastResult?.isWinner);
    const totalWinnings = winners.reduce(
      (s, b) => s + (b.lastResult?.prizeAmount || 0),
      0
    );

    // By denomination
    const byDenomination: Record<number, number> = {};
    for (const b of activeBonds) {
      byDenomination[b.denomination] = (byDenomination[b.denomination] || 0) + 1;
    }

    // By status
    const byStatus = {
      active: bonds.filter((b) => b.status === "active").length,
      sold: bonds.filter((b) => b.status === "sold").length,
      lost: bonds.filter((b) => b.status === "lost").length,
      expired: bonds.filter((b) => b.status === "expired").length,
    };

    // Monthly activity (last 6 months)
    const now = new Date();
    const monthlyActivity: { month: string; bonds: number; checks: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const bondsAdded = bonds.filter((b) => {
        const c = new Date(b.createdAt);
        return c >= monthStart && c <= monthEnd;
      }).length;

      const checksCount = recentActivity.filter((a) => {
        const c = new Date(a.createdAt);
        return a.type === "bond_checked" && c >= monthStart && c <= monthEnd;
      }).length;

      monthlyActivity.push({ month: label, bonds: bondsAdded, checks: checksCount });
    }

    // Winning history for chart
    const winningHistory = winners.map((b) => ({
      bondNumber: b.bondNumber,
      denomination: b.denomination,
      prizeAmount: b.lastResult?.prizeAmount || 0,
      drawDate: b.lastResult?.drawDate,
    }));

    // Currency rates for chart
    const pkrRate = rates?.rates?.["PKR"] || null;

    return successResponse({
      bonds: {
        total: bonds.length,
        active: activeBonds.length,
        totalValue,
        winners: winners.length,
        totalWinnings,
        byDenomination: Object.entries(byDenomination).map(
          ([denomination, count]) => ({
            denomination: parseInt(denomination),
            count,
            value: parseInt(denomination) * count,
          })
        ),
        byStatus,
        winningHistory,
        monthlyActivity,
      },
      currency: {
        pkrPerUsd: pkrRate,
        lastUpdated: rates?.timestamp,
        source: rates?.source,
        isCached: rates?.isCached,
      },
      hasData: bonds.length > 0,
    });
  } catch (error) {
    console.error("[GET /api/analytics/dashboard]", error);
    return errorResponse("Failed to load analytics.", 500);
  }
}
