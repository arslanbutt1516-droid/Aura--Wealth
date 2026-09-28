import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import { CurrencyAlert } from "@/models/Currency";
import ActivityLog from "@/models/ActivityLog";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;

    const alert = await CurrencyAlert.findOneAndDelete({
      _id: id,
      userId: user.userId,
    });

    if (!alert) return errorResponse("Alert not found.", 404);

    await ActivityLog.create({
      userId: user.userId,
      type: "alert_deleted",
      description: `Deleted currency alert for ${alert.baseCurrency}/${alert.targetCurrency}`,
      metadata: {},
    });

    return successResponse(null, "Alert deleted.");
  } catch (error) {
    console.error("[DELETE /api/currency/alerts/:id]", error);
    return errorResponse("Failed to delete alert.", 500);
  }
}
