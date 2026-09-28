import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDraw extends Document {
  _id: mongoose.Types.ObjectId;
  denomination: number;
  drawNumber: string;
  drawDate: Date;
  location: string;
  status: "upcoming" | "completed" | "cancelled";
  source: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DrawSchema = new Schema<IDraw>(
  {
    denomination: {
      type: Number,
      required: true,
      index: true,
    },
    drawNumber: {
      type: String,
      required: true,
      trim: true,
    },
    drawDate: {
      type: Date,
      required: true,
      index: true,
    },
    location: {
      type: String,
      default: "Pakistan",
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    source: {
      type: String,
      default: "SBP - State Bank of Pakistan",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

DrawSchema.index({ denomination: 1, drawDate: -1 });
DrawSchema.index({ status: 1, drawDate: 1 });

const Draw: Model<IDraw> =
  mongoose.models.Draw || mongoose.model<IDraw>("Draw", DrawSchema);

export default Draw;

// ─────────────────────────────────────────────────────────────
// WinningResult
// ─────────────────────────────────────────────────────────────

export interface IWinningResult extends Document {
  _id: mongoose.Types.ObjectId;
  drawId: mongoose.Types.ObjectId;
  denomination: number;
  bondNumber: string;
  prizeAmount: number;
  prizePosition: number;
  source: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WinningResultSchema = new Schema<IWinningResult>(
  {
    drawId: {
      type: Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
      index: true,
    },
    denomination: {
      type: Number,
      required: true,
      index: true,
    },
    bondNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    prizeAmount: {
      type: Number,
      required: true,
    },
    prizePosition: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      default: "SBP - State Bank of Pakistan",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

WinningResultSchema.index({ bondNumber: 1, denomination: 1, drawId: 1 });
WinningResultSchema.index({ denomination: 1, drawId: 1 });

export const WinningResult: Model<IWinningResult> =
  mongoose.models.WinningResult ||
  mongoose.model<IWinningResult>("WinningResult", WinningResultSchema);
