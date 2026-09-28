import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Currency Rate ───────────────────────────────────────────
export interface ICurrencyRate extends Document {
  base: string;
  rates: Record<string, number>;
  source: string;
  fetchedAt: Date;
  createdAt: Date;
}

const CurrencyRateSchema = new Schema<ICurrencyRate>(
  {
    base: { type: String, required: true, uppercase: true, index: true },
    rates: { type: Schema.Types.Mixed, required: true },
    source: { type: String, default: "exchangerate-api.com" },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CurrencyRateSchema.index({ base: 1, fetchedAt: -1 });

export const CurrencyRate: Model<ICurrencyRate> =
  mongoose.models.CurrencyRate ||
  mongoose.model<ICurrencyRate>("CurrencyRate", CurrencyRateSchema);

// ─── Currency History ────────────────────────────────────────
export interface ICurrencyHistory extends Document {
  base: string;
  target: string;
  rate: number;
  date: Date;
  source: string;
  createdAt: Date;
}

const CurrencyHistorySchema = new Schema<ICurrencyHistory>(
  {
    base: { type: String, required: true, uppercase: true },
    target: { type: String, required: true, uppercase: true },
    rate: { type: Number, required: true },
    date: { type: Date, required: true },
    source: { type: String, default: "exchangerate-api.com" },
  },
  { timestamps: true }
);

CurrencyHistorySchema.index({ base: 1, target: 1, date: -1 });
CurrencyHistorySchema.index({ date: -1 });

export const CurrencyHistory: Model<ICurrencyHistory> =
  mongoose.models.CurrencyHistory ||
  mongoose.model<ICurrencyHistory>("CurrencyHistory", CurrencyHistorySchema);

// ─── Currency Alert ──────────────────────────────────────────
export interface ICurrencyAlert extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  baseCurrency: string;
  targetCurrency: string;
  targetRate: number;
  direction: "above" | "below";
  enabled: boolean;
  triggered: boolean;
  triggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CurrencyAlertSchema = new Schema<ICurrencyAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    baseCurrency: { type: String, required: true, uppercase: true },
    targetCurrency: { type: String, required: true, uppercase: true },
    targetRate: { type: Number, required: true },
    direction: { type: String, enum: ["above", "below"], required: true },
    enabled: { type: Boolean, default: true },
    triggered: { type: Boolean, default: false },
    triggeredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CurrencyAlertSchema.index({ userId: 1, enabled: 1 });

export const CurrencyAlert: Model<ICurrencyAlert> =
  mongoose.models.CurrencyAlert ||
  mongoose.model<ICurrencyAlert>("CurrencyAlert", CurrencyAlertSchema);
