import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Draw from "@/models/Draw";
import { WinningResult } from "@/models/Draw";
import { errorResponse, successResponse } from "@/lib/api-helpers";

/**
 * Seed endpoint — only for development.
 * Populates Draw and WinningResult collections with sample data.
 * GET /api/seed
 */
export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return errorResponse("Seed endpoint disabled in production.", 403);
  }

  try {
    await dbConnect();

    // Clear existing seed data
    await Draw.deleteMany({});
    await WinningResult.deleteMany({});

    // Create draws
    const draws = await Draw.insertMany([
      {
        denomination: 100,
        drawNumber: "48",
        drawDate: new Date("2026-01-15"),
        location: "Karachi",
        status: "completed",
        source: "SBP - State Bank of Pakistan",
        publishedAt: new Date("2026-01-15"),
      },
      {
        denomination: 200,
        drawNumber: "95",
        drawDate: new Date("2026-02-15"),
        location: "Lahore",
        status: "completed",
        source: "SBP - State Bank of Pakistan",
        publishedAt: new Date("2026-02-15"),
      },
      {
        denomination: 750,
        drawNumber: "100",
        drawDate: new Date("2026-03-15"),
        location: "Islamabad",
        status: "completed",
        source: "SBP - State Bank of Pakistan",
        publishedAt: new Date("2026-03-15"),
      },
      {
        denomination: 1500,
        drawNumber: "97",
        drawDate: new Date("2026-04-15"),
        location: "Peshawar",
        status: "completed",
        source: "SBP - State Bank of Pakistan",
        publishedAt: new Date("2026-04-15"),
      },
      {
        denomination: 25000,
        drawNumber: "47",
        drawDate: new Date("2026-06-02"),
        location: "Quetta",
        status: "completed",
        source: "SBP - State Bank of Pakistan",
        publishedAt: new Date("2026-06-02"),
      },
      {
        denomination: 40000,
        drawNumber: "88",
        drawDate: new Date("2026-07-01"),
        location: "Karachi",
        status: "completed",
        source: "SBP - State Bank of Pakistan",
        publishedAt: new Date("2026-07-01"),
      },
      // Upcoming draws (future 2026)
      {
        denomination: 750,
        drawNumber: "101",
        drawDate: new Date("2026-10-15"),
        location: "Lahore",
        status: "upcoming",
        source: "SBP - State Bank of Pakistan",
        publishedAt: null,
      },
      {
        denomination: 1500,
        drawNumber: "98",
        drawDate: new Date("2026-11-15"),
        location: "Karachi",
        status: "upcoming",
        source: "SBP - State Bank of Pakistan",
        publishedAt: null,
      },
      {
        denomination: 25000,
        drawNumber: "48",
        drawDate: new Date("2026-12-01"),
        location: "Islamabad",
        status: "upcoming",
        source: "SBP - State Bank of Pakistan",
        publishedAt: null,
      },
    ]);

    // Create winning results for completed draws
    const winningResults = [];
    const completedDraws = draws.filter((d) => d.status === "completed");

    for (const draw of completedDraws) {
      const denomWinners: Array<{
        bondNumber: string;
        prizeAmount: number;
        prizePosition: number;
      }> = [];

      // 1st prize
      denomWinners.push({
        bondNumber: String(Math.floor(100000 + Math.random() * 900000)).slice(1),
        prizeAmount: draw.denomination === 100 ? 700000
          : draw.denomination === 200 ? 750000
          : draw.denomination === 750 ? 3000000
          : draw.denomination === 1500 ? 3000000
          : draw.denomination === 25000 ? 50000000
          : 75000000,
        prizePosition: 1,
      });

      // 2nd prizes (3 winners)
      for (let j = 0; j < 3; j++) {
        denomWinners.push({
          bondNumber: String(Math.floor(100000 + Math.random() * 900000)).slice(1),
          prizeAmount: draw.denomination === 100 ? 200000
            : draw.denomination === 200 ? 250000
            : draw.denomination === 750 ? 1000000
            : draw.denomination === 1500 ? 1000000
            : draw.denomination === 25000 ? 15000000
            : 25000000,
          prizePosition: 2,
        });
      }

      // 3rd prizes (5 winners)
      for (let j = 0; j < 5; j++) {
        denomWinners.push({
          bondNumber: String(Math.floor(100000 + Math.random() * 900000)).slice(1),
          prizeAmount: draw.denomination === 100 ? 1000
            : draw.denomination === 200 ? 1250
            : draw.denomination === 750 ? 18500
            : draw.denomination === 1500 ? 18500
            : draw.denomination === 25000 ? 312000
            : 500000,
          prizePosition: 3,
        });
      }

      for (const w of denomWinners) {
        winningResults.push({
          drawId: draw._id,
          denomination: draw.denomination,
          bondNumber: w.bondNumber,
          prizeAmount: w.prizeAmount,
          prizePosition: w.prizePosition,
          source: "SBP - State Bank of Pakistan",
          publishedAt: draw.drawDate,
        });
      }
    }

    await WinningResult.insertMany(winningResults);

    return successResponse({
      draws: draws.length,
      winningResults: winningResults.length,
      message: "Seed data created successfully. Use these bond numbers to test the checker.",
      sampleWinners: winningResults.slice(0, 5).map((w) => ({
        bondNumber: w.bondNumber,
        denomination: w.denomination,
        prizeAmount: w.prizeAmount,
        prizePosition: w.prizePosition,
      })),
    });
  } catch (error) {
    console.error("[GET /api/seed]", error);
    return errorResponse("Seeding failed: " + String(error), 500);
  }
}
