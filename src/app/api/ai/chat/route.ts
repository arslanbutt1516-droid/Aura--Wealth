import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-helpers";
import dbConnect from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PrizeBond from "@/models/PrizeBond";
import Draw from "@/models/Draw";
import { WinningResult } from "@/models/Draw";
import { ChatSession, ChatMessage } from "@/models/Chat";
import ActivityLog from "@/models/ActivityLog";
import User from "@/models/User";
import { getLiveRates, convertCurrency, calculatePercentageChange } from "@/services/currencyService";

// ─── Tool Functions ───────────────────────────────────────────────────────────

async function getUserBonds(userId: string) {
  const bonds = await PrizeBond.find({ userId, status: "active" }).lean();
  return bonds.map((b) => ({
    bondNumber: b.bondNumber,
    denomination: b.denomination,
    purchaseDate: b.purchaseDate,
    lastChecked: b.lastChecked,
    lastResult: b.lastResult,
  }));
}

async function getPortfolioSummary(userId: string) {
  const bonds = await PrizeBond.find({ userId }).lean();
  const active = bonds.filter((b) => b.status === "active");
  const winners = bonds.filter((b) => b.lastResult?.isWinner);
  const totalValue = active.reduce((s, b) => s + b.denomination, 0);
  const totalWinnings = winners.reduce(
    (s, b) => s + (b.lastResult?.prizeAmount || 0),
    0
  );
  const byDenomination: Record<number, number> = {};
  for (const b of active) {
    byDenomination[b.denomination] = (byDenomination[b.denomination] || 0) + 1;
  }
  return {
    totalBonds: active.length,
    totalValue,
    winningBonds: winners.length,
    totalWinnings,
    byDenomination,
  };
}

async function getWinningHistory(userId: string) {
  const winners = await PrizeBond.find({
    userId,
    "lastResult.isWinner": true,
  }).lean();
  return winners.map((b) => ({
    bondNumber: b.bondNumber,
    denomination: b.denomination,
    prizeAmount: b.lastResult?.prizeAmount,
    drawNumber: b.lastResult?.drawNumber,
    drawDate: b.lastResult?.drawDate,
  }));
}

async function getUpcomingDraws() {
  const draws = await Draw.find({ status: "upcoming" })
    .sort({ drawDate: 1 })
    .limit(5)
    .lean();
  return draws.map((d) => ({
    denomination: d.denomination,
    drawNumber: d.drawNumber,
    drawDate: d.drawDate,
    location: d.location,
  }));
}

async function getCurrencyRate(base: string, target: string) {
  const rates = await getLiveRates("USD");
  const baseRate = rates.rates[base] || 1;
  const targetRate = rates.rates[target];
  if (!targetRate)
    return { error: `Currency ${target} not available` };
  const rate = parseFloat((targetRate / baseRate).toFixed(6));
  return {
    base,
    target,
    rate,
    timestamp: rates.timestamp,
    source: rates.source,
    isCached: rates.isCached,
  };
}

async function convertCurrencyTool(
  amount: number,
  from: string,
  to: string
) {
  const rates = await getLiveRates("USD");
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  if (!fromRate || !toRate)
    return { error: `Unsupported currencies: ${from}/${to}` };
  const result = convertCurrency(amount, fromRate, toRate);
  return {
    amount,
    from,
    to,
    result,
    rate: parseFloat((toRate / fromRate).toFixed(6)),
    timestamp: rates.timestamp,
    source: rates.source,
  };
}

// ─── System Prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(userName: string) {
  return `You are Aura Wealth Terminal Assistant, a smart financial assistant for Pakistan Prize Bonds and currency exchange.

User: ${userName}

You have access to the user's real financial data. When answering financial questions, always use the tool results provided — never make up numbers, rates, or bond information.

Your capabilities:
- Check prize bond portfolio and winning status
- Show currency exchange rates (PKR, USD, EUR, GBP, AED, SAR, etc.)
- Convert currencies accurately using live rates
- Show upcoming draw schedules
- Summarize portfolio value

Rules:
1. NEVER fabricate financial data (rates, bond results, prize amounts)
2. If data is unavailable, say so clearly
3. Always mention when rates are cached vs live
4. Be helpful, concise, and professional
5. Format numbers with commas for readability (e.g., Rs. 25,000)
6. Amounts in PKR should use "Rs." prefix

Disclaimer: Aura Wealth Terminal provides informational assistance. Always verify financial decisions with official sources.`;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return errorResponse("Unauthorized.", 401);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return errorResponse(
        "AI assistant not configured. Please add GEMINI_API_KEY to environment variables.",
        503
      );
    }

    await dbConnect();

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return errorResponse("Message is required.", 400);
    }

    if (message.length > 2000) {
      return errorResponse("Message is too long (max 2000 characters).", 400);
    }

    const userDoc = await User.findById(user.userId).lean();
    if (!userDoc) return errorResponse("User not found.", 404);

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findOne({
        _id: sessionId,
        userId: user.userId,
      });
    }
    if (!session) {
      session = await ChatSession.create({
        userId: user.userId,
        title: message.slice(0, 60) + (message.length > 60 ? "…" : ""),
      });
    }

    // Load previous messages for context (last 10)
    const previousMessages = await ChatMessage.find({
      sessionId: session._id,
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // ─── Detect intent and gather tool data ─────────────────────────────
    const lowerMsg = message.toLowerCase();
    let toolUsed: string | null = null;
    let toolResult: unknown = null;

    if (
      lowerMsg.includes("bond") ||
      lowerMsg.includes("portfolio") ||
      lowerMsg.includes("win") ||
      lowerMsg.includes("prize")
    ) {
      if (lowerMsg.includes("win") || lowerMsg.includes("winner")) {
        toolUsed = "getWinningHistory";
        toolResult = await getWinningHistory(user.userId);
      } else if (
        lowerMsg.includes("portfolio") ||
        lowerMsg.includes("summary") ||
        lowerMsg.includes("total")
      ) {
        toolUsed = "getPortfolioSummary";
        toolResult = await getPortfolioSummary(user.userId);
      } else {
        toolUsed = "getUserBonds";
        toolResult = await getUserBonds(user.userId);
      }
    } else if (
      lowerMsg.includes("draw") ||
      lowerMsg.includes("upcoming") ||
      lowerMsg.includes("next draw")
    ) {
      toolUsed = "getUpcomingDraws";
      toolResult = await getUpcomingDraws();
    } else if (lowerMsg.includes("convert") || lowerMsg.match(/\d+\s*[a-z]{3}/i)) {
      // Try to parse conversion request
      const match = message.match(/(\d+(?:\.\d+)?)\s*([A-Za-z]{3})\s*(?:to|in)\s*([A-Za-z]{3})/i);
      if (match) {
        const [, amt, from, to] = match;
        toolUsed = "convertCurrency";
        toolResult = await convertCurrencyTool(parseFloat(amt), from.toUpperCase(), to.toUpperCase());
      } else {
        toolUsed = "getCurrencyRate_USD_PKR";
        toolResult = await getCurrencyRate("USD", "PKR");
      }
    } else if (
      lowerMsg.includes("rate") ||
      lowerMsg.includes("currency") ||
      lowerMsg.includes("usd") ||
      lowerMsg.includes("pkr") ||
      lowerMsg.includes("exchange")
    ) {
      // Extract currency pair if possible
      const currencyMatch = message.match(/([A-Za-z]{3})\s*(?:\/|to)\s*([A-Za-z]{3})/i);
      if (currencyMatch) {
        const [, base, target] = currencyMatch;
        toolUsed = `getCurrencyRate_${base.toUpperCase()}_${target.toUpperCase()}`;
        toolResult = await getCurrencyRate(base.toUpperCase(), target.toUpperCase());
      } else {
        toolUsed = "getCurrencyRate_USD_PKR";
        toolResult = await getCurrencyRate("USD", "PKR");
      }
    }

    // ─── Build Gemini conversation ───────────────────────────────────────
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: buildSystemPrompt(userDoc.name),
    });

    // Build history for multi-turn
    const history = previousMessages.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.message }],
    }));

    const chat = model.startChat({ history });

    // Augment user message with tool data
    let augmentedMessage = message;
    if (toolResult) {
      augmentedMessage = `User question: ${message}

[TOOL DATA - ${toolUsed}]:
${JSON.stringify(toolResult, null, 2)}

Please answer the user's question using this real data. Do not fabricate any numbers.`;
    }

    // BUG-07 FIX: Save user message BEFORE calling AI
    // This ensures conversation history is preserved even if the AI call fails
    await ChatMessage.create({
      sessionId: session._id,
      userId: user.userId,
      role: "user",
      message: message,
      toolUsed: null,
      toolResult: null,
    });

    const result = await chat.sendMessage(augmentedMessage);
    const aiResponse = result.response.text();

    // Save assistant response
    await ChatMessage.create({
      sessionId: session._id,
      userId: user.userId,
      role: "assistant",
      message: aiResponse,
      toolUsed,
      toolResult,
    });

    // Update session title from first message
    if (previousMessages.length === 0) {
      await ChatSession.findByIdAndUpdate(session._id, {
        title: message.slice(0, 80),
        updatedAt: new Date(),
      });
    }

    // Activity log
    await ActivityLog.create({
      userId: user.userId,
      type: "ai_question",
      description: `AI question: ${message.slice(0, 100)}`,
      metadata: { sessionId: session._id.toString(), toolUsed },
    });

    return successResponse({
      sessionId: session._id.toString(),
      response: aiResponse,
      toolUsed,
      hasToolData: !!toolResult,
    });
  } catch (error) {
    console.error("[POST /api/ai/chat]", error);
    const msg = error instanceof Error ? error.message : "AI request failed";
    return errorResponse(`AI assistant error: ${msg}`, 500);
  }
}
