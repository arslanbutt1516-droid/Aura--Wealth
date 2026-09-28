import { NextRequest, NextResponse } from "next/server";
import { getLiveRates } from "@/services/currencyService";
import { errorResponse, successResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get("base") || "USD";

    const rates = await getLiveRates(base.toUpperCase());

    return successResponse({
      base: rates.base,
      rates: rates.rates,
      timestamp: rates.timestamp,
      source: rates.source,
      isCached: rates.isCached,
    });
  } catch (error) {
    console.error("[GET /api/currency/rates]", error);
    return errorResponse("Failed to fetch currency rates.", 500);
  }
}
