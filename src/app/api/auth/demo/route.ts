import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PrizeBond from "@/models/PrizeBond";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    await dbConnect();

    const demoEmail = "demo@auraterminal.com";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const passwordHash = await bcrypt.hash("demo1234", 10);
      user = await User.create({
        name: "Demo Investor",
        email: demoEmail,
        passwordHash,
        role: "user",
        preferredCurrency: "PKR",
        notificationPreferences: {
          email: true,
          inApp: true,
          whatsapp: false,
        },
      });

      // Seed a few demo prize bonds for instant dashboard visualization
      await PrizeBond.create([
        {
          userId: user._id,
          bondNumber: "482671",
          denomination: 1500,
          purchaseDate: new Date("2025-01-15"),
          notes: "Winning bond demo",
          status: "active",
          lastChecked: new Date(),
          lastResult: {
            isWinner: true,
            prizeAmount: 1000000,
            prizePosition: 2,
            drawNumber: "102",
            drawDate: new Date("2026-05-15"),
            checkedAt: new Date(),
          },
        },
        {
          userId: user._id,
          bondNumber: "123456",
          denomination: 750,
          purchaseDate: new Date("2025-03-10"),
          notes: "Lahore series",
          status: "active",
          lastChecked: new Date(),
        },
        {
          userId: user._id,
          bondNumber: "789012",
          denomination: 200,
          purchaseDate: new Date("2025-04-01"),
          notes: "Karachi series",
          status: "active",
          lastChecked: new Date(),
        },
        {
          userId: user._id,
          bondNumber: "654321",
          denomination: 25000,
          purchaseDate: new Date("2025-02-20"),
          notes: "Premium registered bond",
          status: "active",
          lastChecked: new Date(),
        },
      ]);
    }

    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      redirect: "/dashboard",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/auth/demo] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to start demo session" },
      { status: 500 }
    );
  }
}
