/**
 * Currency Service
 * Fetches live exchange rates from external API with caching fallback.
 * Never hard-codes exchange rates.
 */

import { CurrencyRate, CurrencyHistory } from "@/models/Currency";
import dbConnect from "@/lib/db";

export const SUPPORTED_CURRENCIES = [
  "PKR", "USD", "EUR", "GBP", "AED", "SAR", "CAD", "AUD", "CNY",
  "JPY", "CHF", "KWD", "QAR", "OMR", "BHD", "TRY", "MYR", "SGD",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: Date;
  source: string;
  isCached: boolean;
}

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch live exchange rates from external API, with DB cache fallback.
 */
export async function getLiveRates(base = "USD"): Promise<ExchangeRates> {
  await dbConnect();

  // Check DB cache first
  const cached = await CurrencyRate.findOne({ base: base.toUpperCase() })
    .sort({ fetchedAt: -1 })
    .lean();

  const now = Date.now();
  const cacheAge = cached
    ? now - new Date(cached.fetchedAt).getTime()
    : Infinity;

  if (cached && cacheAge < CACHE_DURATION_MS) {
    return {
      base: cached.base,
      rates: cached.rates as Record<string, number>,
      timestamp: new Date(cached.fetchedAt),
      source: cached.source,
      isCached: true,
    };
  }

  // Try live API
  const apiKey = process.env.CURRENCY_API_KEY;
  const baseUrl = process.env.CURRENCY_API_BASE_URL || "https://api.exchangerate-api.com/v4/latest";

  if (baseUrl) {
    try {
      const url = `${baseUrl}/${base.toUpperCase()}`;
      const resp = await fetch(url, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        next: { revalidate: 3600 },
      });

      if (resp.ok) {
        const data = await resp.json();
        const rates = data.rates || data.conversion_rates || {};

        // BUG-06 FIX: Use upsert instead of create to keep only 1 doc per base currency
        await CurrencyRate.findOneAndUpdate(
          { base: base.toUpperCase() },
          { $set: { rates, source: "exchangerate-api.com", fetchedAt: new Date() } },
          { upsert: true, new: true }
        );

        // Store history snapshots
        await storeCurrencyHistory(base.toUpperCase(), rates);

        return {
          base: base.toUpperCase(),
          rates,
          timestamp: new Date(),
          source: "exchangerate-api.com (live)",
          isCached: false,
        };
      }
    } catch (err) {
      console.error("Currency API fetch failed:", err);
    }
  }

  // Fall back to old cache
  if (cached) {
    console.warn("Using stale currency cache");
    return {
      base: cached.base,
      rates: cached.rates as Record<string, number>,
      timestamp: new Date(cached.fetchedAt),
      source: `${cached.source} (cached — last updated ${new Date(cached.fetchedAt).toLocaleString()})`,
      isCached: true,
    };
  }

  // No API key and no cache — return empty with clear message
  return {
    base: base.toUpperCase(),
    rates: {},
    timestamp: new Date(),
    source: "No currency API configured",
    isCached: false,
  };
}

async function storeCurrencyHistory(
  base: string,
  rates: Record<string, number>
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bulk = Object.entries(rates)
    .filter(([target]) => SUPPORTED_CURRENCIES.includes(target as SupportedCurrency))
    .map(([target, rate]) => ({
      updateOne: {
        filter: { base, target, date: today },
        update: { $set: { base, target, rate, date: today, source: "exchangerate-api.com" } },
        upsert: true,
      },
    }));

  if (bulk.length > 0) {
    await CurrencyHistory.bulkWrite(bulk);
  }
}

export async function getHistoricalRates(
  base: string,
  target: string,
  days: number
): Promise<{ date: string; rate: number }[]> {
  await dbConnect();

  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await CurrencyHistory.find({
    base: base.toUpperCase(),
    target: target.toUpperCase(),
    date: { $gte: since },
  })
    .sort({ date: 1 })
    .lean();

  return history.map((h) => ({
    date: new Date(h.date).toISOString().split("T")[0],
    rate: h.rate,
  }));
}

export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number
): number {
  if (fromRate === 0) return 0;
  // Convert to base then to target
  const inBase = amount / fromRate;
  return parseFloat((inBase * toRate).toFixed(6));
}

export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
}
