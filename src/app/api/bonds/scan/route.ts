import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import ActivityLog from "@/models/ActivityLog";
import dbConnect from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return errorResponse(
        "AI scanner not configured. Please add GEMINI_API_KEY to environment variables.",
        503
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return errorResponse("No image provided.", 400);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return errorResponse("File must be an image (JPEG, PNG, WebP, etc.)", 400);
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return errorResponse("Image size must be less than 10MB.", 400);
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp";

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a prize bond number scanner for Pakistan Prize Bonds issued by the State Bank of Pakistan.

Analyze this image and extract the 6-digit prize bond number. Pakistan Prize Bonds have serial numbers that are exactly 6 digits.

Rules:
1. Look for a prominent 6-digit number on the bond
2. If you can clearly identify a 6-digit bond number, return it
3. If the image is blurry, unclear, or no bond number is visible, say so
4. Do NOT guess or make up numbers
5. Only return the number if you are confident

Respond in this exact JSON format:
{
  "detected": true/false,
  "bondNumber": "123456" or null,
  "confidence": "high/medium/low",
  "notes": "Brief description of what you see",
  "issues": "Any issues with the image (blurry, incomplete, etc.)"
}`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();

    // Parse JSON response
    let parsedResult;
    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");
      parsedResult = JSON.parse(jsonMatch[0]);
    } catch {
      return errorResponse(
        "Could not parse AI response. Please try again with a clearer image.",
        422
      );
    }

    await dbConnect();
    await ActivityLog.create({
      userId: user.userId,
      type: "bond_scanned",
      description: `Bond scanned via AI — ${parsedResult.detected ? `Detected: ${parsedResult.bondNumber}` : "No number detected"}`,
      metadata: { confidence: parsedResult.confidence, detected: parsedResult.detected },
    });

    return successResponse({
      detected: parsedResult.detected || false,
      bondNumber: parsedResult.bondNumber || null,
      confidence: parsedResult.confidence || "low",
      notes: parsedResult.notes || "",
      issues: parsedResult.issues || "",
      disclaimer:
        "Always verify the detected number before checking. AI detection may not be 100% accurate.",
    });
  } catch (error) {
    console.error("[POST /api/bonds/scan]", error);
    const msg =
      error instanceof Error ? error.message : "AI scanning failed";
    return errorResponse(`Scanning failed: ${msg}`, 500);
  }
}
