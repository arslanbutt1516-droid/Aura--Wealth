import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import Draw from "@/models/Draw";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const denomination = searchParams.get("denomination");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (denomination) filter.denomination = parseInt(denomination);
    if (status) filter.status = status;

    const draws = await Draw.find(filter)
      .sort({ drawDate: -1 })
      .limit(20)
      .lean();

    return successResponse(
      draws.map((d) => ({
        id: d._id.toString(),
        denomination: d.denomination,
        drawNumber: d.drawNumber,
        drawDate: d.drawDate,
        location: d.location,
        status: d.status,
        source: d.source,
        publishedAt: d.publishedAt,
      }))
    );
  } catch (error) {
    console.error("[GET /api/draws]", error);
    return errorResponse("Failed to fetch draws.", 500);
  }
}
