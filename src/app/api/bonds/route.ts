import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse, serializeDocs } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import PrizeBond from "@/models/PrizeBond";
import ActivityLog from "@/models/ActivityLog";
import { addBondSchema } from "@/lib/validations";

// GET /api/bonds - List user's bonds
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const denomination = searchParams.get("denomination");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = { userId: user.userId };
    if (denomination) filter.denomination = parseInt(denomination);
    if (status) filter.status = status;

    const bonds = await PrizeBond.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(serializeDocs(bonds));
  } catch (error) {
    console.error("[GET /api/bonds]", error);
    return errorResponse("Failed to fetch bonds.", 500);
  }
}

// POST /api/bonds - Add a new bond
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    await dbConnect();

    const body = await request.json();
    const result = addBondSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
      return errorResponse(firstError, 400);
    }

    const { bondNumber, denomination, purchaseDate, notes } = result.data;

    // Check for duplicate bond in user's portfolio
    const existing = await PrizeBond.findOne({
      userId: user.userId,
      bondNumber,
      denomination,
    });
    if (existing) {
      return errorResponse(
        `Bond ${bondNumber} (Rs. ${denomination}) is already in your portfolio.`,
        409
      );
    }

    const bond = await PrizeBond.create({
      userId: user.userId,
      bondNumber,
      denomination,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      notes: notes || "",
      status: "active",
    });

    // Activity log
    await ActivityLog.create({
      userId: user.userId,
      type: "bond_added",
      description: `Added bond ${bondNumber} (Rs. ${denomination.toLocaleString()})`,
      metadata: { bondNumber, denomination },
    });

    return successResponse(
      {
        id: bond._id.toString(),
        bondNumber: bond.bondNumber,
        denomination: bond.denomination,
        purchaseDate: bond.purchaseDate,
        status: bond.status,
        notes: bond.notes,
        createdAt: bond.createdAt,
      },
      "Prize bond added successfully!",
      201
    );
  } catch (error) {
    console.error("[POST /api/bonds]", error);
    return errorResponse("Failed to add bond.", 500);
  }
}
