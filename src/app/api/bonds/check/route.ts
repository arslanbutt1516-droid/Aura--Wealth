import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import PrizeBond from "@/models/PrizeBond";
import { WinningResult } from "@/models/Draw";
import Draw from "@/models/Draw";
import ActivityLog from "@/models/ActivityLog";
import Notification from "@/models/Notification";
import { checkBondSchema } from "@/lib/validations";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();

    const body = await request.json();
    const result = checkBondSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { bondNumber, denomination } = result.data;
    const checkedAt = new Date();

    // Search WinningResults in DB
    const winningResult = await WinningResult.findOne({
      bondNumber,
      denomination,
    })
      .populate("drawId")
      .lean();

    let checkResult;

    if (winningResult) {
      const draw = winningResult.drawId as unknown as {
        drawNumber: string;
        drawDate: Date;
        location: string;
      };
      checkResult = {
        isWinner: true,
        bondNumber,
        denomination,
        prizeAmount: winningResult.prizeAmount,
        prizePosition: winningResult.prizePosition,
        drawNumber: draw?.drawNumber || "N/A",
        drawDate: draw?.drawDate || null,
        location: draw?.location || "Pakistan",
        source: winningResult.source,
        checkedAt,
        message: `Congratulations! Bond ${bondNumber} won Rs. ${winningResult.prizeAmount.toLocaleString()} (Position #${winningResult.prizePosition})`,
      };

      // Send winning notification
      await Notification.create({
        userId: user.userId,
        type: "prize_win",
        title: "🎉 Your Bond Won a Prize!",
        message: `Bond ${bondNumber} (Rs. ${denomination.toLocaleString()}) won Rs. ${winningResult.prizeAmount.toLocaleString()}!`,
        channel: "in_app",
        metadata: { bondNumber, denomination, prizeAmount: winningResult.prizeAmount },
      });
    } else {
      // Check if we have any draw data for this denomination
      const latestDraw = await Draw.findOne({ denomination, status: "completed" })
        .sort({ drawDate: -1 })
        .lean();

      if (latestDraw) {
        checkResult = {
          isWinner: false,
          bondNumber,
          denomination,
          prizeAmount: 0,
          prizePosition: 0,
          drawNumber: latestDraw.drawNumber,
          drawDate: latestDraw.drawDate,
          location: latestDraw.location,
          source: latestDraw.source,
          checkedAt,
          message: `Bond ${bondNumber} did not win in Draw #${latestDraw.drawNumber}. Better luck next time!`,
        };
      } else {
        // No draw data available
        checkResult = {
          isWinner: null,
          bondNumber,
          denomination,
          prizeAmount: 0,
          prizePosition: 0,
          drawNumber: null,
          drawDate: null,
          location: null,
          source: null,
          checkedAt,
          message:
            "Result could not be verified against our database. No draw results available for this denomination yet. Please verify with the official State Bank of Pakistan website.",
          verifyUrl: "https://www.sbp.org.pk/prize_bonds/index.htm",
        };
      }
    }

    // Update bond in portfolio if it exists
    await PrizeBond.findOneAndUpdate(
      { userId: user.userId, bondNumber, denomination },
      {
        lastChecked: checkedAt,
        lastResult:
          checkResult.isWinner !== null
            ? {
                isWinner: checkResult.isWinner,
                prizeAmount: checkResult.prizeAmount,
                prizePosition: checkResult.prizePosition,
                drawNumber: checkResult.drawNumber,
                drawDate: checkResult.drawDate,
                checkedAt,
              }
            : undefined,
      }
    );

    // Activity log
    await ActivityLog.create({
      userId: user.userId,
      type: "bond_checked",
      description: `Checked bond ${bondNumber} (Rs. ${denomination.toLocaleString()})`,
      metadata: { bondNumber, denomination, isWinner: checkResult.isWinner },
    });

    return successResponse(checkResult);
  } catch (error) {
    console.error("[POST /api/bonds/check]", error);
    return errorResponse("Failed to check bond. Please try again.", 500);
  }
}
