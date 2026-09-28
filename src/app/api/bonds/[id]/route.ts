import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import PrizeBond from "@/models/PrizeBond";
import ActivityLog from "@/models/ActivityLog";

type Params = { params: Promise<{ id: string }> };

// GET /api/bonds/:id
export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;

    const bond = await PrizeBond.findOne({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!bond) return errorResponse("Bond not found.", 404);

    return successResponse({
      id: bond._id.toString(),
      bondNumber: bond.bondNumber,
      denomination: bond.denomination,
      purchaseDate: bond.purchaseDate,
      notes: bond.notes,
      status: bond.status,
      lastChecked: bond.lastChecked,
      lastResult: bond.lastResult,
      createdAt: bond.createdAt,
      updatedAt: bond.updatedAt,
    });
  } catch (error) {
    console.error("[GET /api/bonds/:id]", error);
    return errorResponse("Failed to fetch bond.", 500);
  }
}

// PATCH /api/bonds/:id
export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const allowedFields = ["notes", "status", "purchaseDate", "denomination"];
    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const bond = await PrizeBond.findOneAndUpdate(
      { _id: id, userId: user.userId },
      updates,
      { new: true }
    ).lean();

    if (!bond) return errorResponse("Bond not found.", 404);

    await ActivityLog.create({
      userId: user.userId,
      type: "bond_edited",
      description: `Updated bond ${bond.bondNumber}`,
      metadata: { bondId: id, updates },
    });

    return successResponse({ id: bond._id.toString(), ...bond }, "Bond updated.");
  } catch (error) {
    console.error("[PATCH /api/bonds/:id]", error);
    return errorResponse("Failed to update bond.", 500);
  }
}

// DELETE /api/bonds/:id
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();
    const { id } = await params;

    const bond = await PrizeBond.findOneAndDelete({
      _id: id,
      userId: user.userId,
    }).lean();

    if (!bond) return errorResponse("Bond not found.", 404);

    await ActivityLog.create({
      userId: user.userId,
      type: "bond_deleted",
      description: `Deleted bond ${bond.bondNumber} (Rs. ${bond.denomination.toLocaleString()})`,
      metadata: { bondNumber: bond.bondNumber, denomination: bond.denomination },
    });

    return successResponse(null, "Bond deleted successfully.");
  } catch (error) {
    console.error("[DELETE /api/bonds/:id]", error);
    return errorResponse("Failed to delete bond.", 500);
  }
}
