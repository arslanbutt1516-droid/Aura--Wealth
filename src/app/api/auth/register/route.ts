import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import ActivityLog from "@/models/ActivityLog";
import { signToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import { emailService } from "@/services/emailService";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
      return errorResponse(firstError, 400);
    }

    const {
      name,
      email,
      phone,
      whatsappNumber,
      password,
      preferredCurrency,
      notificationPreferences,
    } = result.data;

    // Check duplicate email
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return errorResponse("An account with this email already exists.", 409);
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      whatsappNumber: whatsappNumber || "",
      passwordHash,
      preferredCurrency: preferredCurrency || "PKR",
      notificationPreferences: {
        email: notificationPreferences?.email ?? true,
        inApp: notificationPreferences?.inApp ?? true,
        whatsapp: notificationPreferences?.whatsapp ?? false,
        prizeWin: true,
        upcomingDraw: true,
        drawResult: true,
        currencyAlert: true,
        accountActivity: false,
      },
      role: "user",
      isVerified: false,
    });

    // Create welcome notification
    await Notification.create({
      userId: user._id,
      type: "account_activity",
      title: "Welcome to Aura Wealth Terminal! 🎉",
      message: `Hello ${name}! Your account has been created successfully. Start by adding your prize bonds to track them.`,
      channel: "in_app",
      isRead: false,
    });

    // Activity log
    await ActivityLog.create({
      userId: user._id,
      type: "account_created",
      description: `New account created for ${email}`,
      metadata: { email, preferredCurrency },
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(name, email).catch(console.error);

    // Create JWT and set cookie
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = successResponse(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          preferredCurrency: user.preferredCurrency,
        },
      },
      "Account created successfully!",
      201
    );

    await setAuthCookie(token);
    return response;
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    const msg = error instanceof Error ? error.message : "Registration failed";
    return errorResponse(msg, 500);
  }
}
