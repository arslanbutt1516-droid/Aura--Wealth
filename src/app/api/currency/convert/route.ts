import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import ActivityLog from "@/models/ActivityLog";
import dbConnect from "@/lib/db";
import { getLiveRates, convertCurrency } from "@/services/currencyService";
import { convertCurrencySchema } from "@/lib/validations";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = convertCurrencySchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { amount, from, to } = result.data;

    const rates = await getLiveRates("USD");

    if (!rates.rates || Object.keys(rates.rates).length === 0) {
      return errorResponse(
        "Currency rates not available. Please configure CURRENCY_API_KEY in environment variables.",
        503
      );
    }

    const fromRate = rates.rates[from];
    const toRate = rates.rates[to];

    if (!fromRate || !toRate) {
      return errorResponse(
        `Unsupported currency pair: ${from}/${to}`,
        400
      );
    }

    const convertedAmount = convertCurrency(amount, fromRate, toRate);
    const rate = parseFloat((toRate / fromRate).toFixed(6));

    // Log activity if user is authenticated
    const user = await getCurrentUser();
    if (user) {
      await dbConnect();
      await ActivityLog.create({
        userId: user.userId,
        type: "currency_converted",
        description: `Converted ${amount} ${from} to ${to}`,
        metadata: { amount, from, to, result: convertedAmount, rate },
      });
    }

    return successResponse({
      amount,
      from,
      to,
      rate,
      convertedAmount,
      timestamp: rates.timestamp,
      source: rates.source,
      isCached: rates.isCached,
    });
  } catch (error) {
    console.error("[POST /api/currency/convert]", error);
    return errorResponse("Currency conversion failed.", 500);
  }
}
