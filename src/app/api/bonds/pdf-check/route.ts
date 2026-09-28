import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import { WinningResult } from "@/models/Draw";
import ActivityLog from "@/models/ActivityLog";

// BUG-03 FIX: Removed non-existent denominations 7500 and 15000
// Correct list matches PrizeBond.ts and validations.ts
const VALID_DENOMINATIONS = [100, 200, 750, 1500, 25000, 40000];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    const formData = await request.formData();
    const file = formData.get("pdf") as File | null;
    const denominationRaw = formData.get("denomination") as string | null;

    if (!file) return errorResponse("No PDF file provided.", 400);
    const isValidPdf =
      file.name.toLowerCase().endsWith(".pdf") ||
      file.type === "application/pdf";
    if (!isValidPdf) return errorResponse("File must be a PDF.", 400);
    if (file.size > 20 * 1024 * 1024)
      return errorResponse("PDF size must be less than 20MB.", 400);

    const denomination = denominationRaw ? parseInt(denominationRaw, 10) : null;
    if (denomination && !VALID_DENOMINATIONS.includes(denomination))
      return errorResponse("Invalid denomination.", 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let pdfText: string;
    try {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      pdfText = textResult.text;
      await parser.destroy();
    } catch (err) {
      console.error("[PDF Parse error]", err);
      return errorResponse(
        "Could not read PDF. Make sure it is a text-based PDF.",
        422
      );
    }

    const rawMatches = pdfText.match(/\b\d{6}\b/g) || [];
    const uniqueBondNumbers = [...new Set(rawMatches)];

    if (uniqueBondNumbers.length === 0) {
      return errorResponse(
        "No 6-digit bond numbers found in this PDF.",
        422
      );
    }

    await dbConnect();
    const winnerQuery: Record<string, unknown> = {
      bondNumber: { $in: uniqueBondNumbers },
    };
    if (denomination) winnerQuery.denomination = denomination;

    const winningResults = await WinningResult.find(winnerQuery)
      .populate("drawId")
      .lean();

    const winners = winningResults.map((wr) => {
      const draw = wr.drawId as unknown as {
        drawNumber: string;
        drawDate: Date;
        location: string;
      };
      return {
        bondNumber: wr.bondNumber,
        denomination: wr.denomination,
        prizeAmount: wr.prizeAmount,
        prizePosition: wr.prizePosition,
        drawNumber: draw?.drawNumber || "N/A",
        drawDate: draw?.drawDate || null,
        location: draw?.location || "Pakistan",
      };
    });

    winners.sort((a, b) => b.prizeAmount - a.prizeAmount);

    await ActivityLog.create({
      userId: user.userId,
      type: "bond_checked",
      description: `PDF bulk check — ${uniqueBondNumbers.length} bond(s), ${winners.length} winner(s)`,
      metadata: { scanned: uniqueBondNumbers.length, winners: winners.length },
    });

    return successResponse({
      totalScanned: uniqueBondNumbers.length,
      totalWinners: winners.length,
      winners,
    });
  } catch (error) {
    console.error("[POST /api/bonds/pdf-check]", error);
    const msg = error instanceof Error ? error.message : "PDF check failed";
    return errorResponse(`PDF check failed: ${msg}`, 500);
  }
}

