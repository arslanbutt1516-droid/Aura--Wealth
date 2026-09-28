import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import { CurrencyAlert } from "@/models/Currency";
import { currencyAlertSchema } from "@/lib/validations";
import ActivityLog from "@/models/ActivityLog";

// GET /api/currency/alerts
export async function GET(): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const alerts = await CurrencyAlert.find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(
      alerts.map((a) => ({
        id: a._id.toString(),
        baseCurrency: a.baseCurrency,
        targetCurrency: a.targetCurrency,
        targetRate: a.targetRate,
        direction: a.direction,
        enabled: a.enabled,
        triggered: a.triggered,
        triggeredAt: a.triggeredAt,
        createdAt: a.createdAt,
      }))
    );
  } catch (error) {
    console.error("[GET /api/currency/alerts]", error);
    return errorResponse("Failed to fetch alerts.", 500);
  }
}

// POST /api/currency/alerts
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const body = await request.json();
    const result = currencyAlertSchema.safeParse(body);

    if (!result.success) {
      const firstError =
        Object.values(result.error.flatten().fieldErrors)[0]?.[0] ||
        "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { baseCurrency, targetCurrency, targetRate, direction } = result.data;

    const alert = await CurrencyAlert.create({
      userId: user.userId,
      baseCurrency,
      targetCurrency,
      targetRate,
      direction,
      enabled: true,
    });

    await ActivityLog.create({
      userId: user.userId,
      type: "alert_created",
      description: `Created alert: notify when ${baseCurrency}/${targetCurrency} goes ${direction} ${targetRate}`,
      metadata: { baseCurrency, targetCurrency, targetRate, direction },
    });

    return successResponse(
      {
        id: alert._id.toString(),
        baseCurrency: alert.baseCurrency,
        targetCurrency: alert.targetCurrency,
        targetRate: alert.targetRate,
        direction: alert.direction,
        enabled: alert.enabled,
      },
      "Alert created successfully!",
      201
    );
  } catch (error) {
    console.error("[POST /api/currency/alerts]", error);
    return errorResponse("Failed to create alert.", 500);
  }
}
