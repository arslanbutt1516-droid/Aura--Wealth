import mongoose, { Schema, Document, Model } from "mongoose";

export const PRIZE_BOND_DENOMINATIONS = [100, 200, 750, 1500, 25000, 40000] as const;
export type PrizeBondDenomination = (typeof PRIZE_BOND_DENOMINATIONS)[number];

export interface IPrizeBond extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  bondNumber: string;
  denomination: PrizeBondDenomination;
  purchaseDate: Date;
  notes: string;
  status: "active" | "sold" | "lost" | "expired";
  lastChecked: Date | null;
  lastResult: {
    isWinner: boolean;
    prizeAmount: number;
    prizePosition: number;
    drawNumber: string;
    drawDate: Date;
    checkedAt: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeBondSchema = new Schema<IPrizeBond>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bondNumber: {
      type: String,
      required: [true, "Bond number is required"],
      trim: true,
      match: [/^\d{6}$/, "Bond number must be exactly 6 digits"],
    },
    denomination: {
      type: Number,
      required: [true, "Denomination is required"],
      enum: {
        values: PRIZE_BOND_DENOMINATIONS,
        message: "Invalid denomination",
      },
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "sold", "lost", "expired"],
      default: "active",
    },
    lastChecked: {
      type: Date,
      default: null,
    },
    lastResult: {
      type: {
        isWinner: Boolean,
        prizeAmount: Number,
        prizePosition: Number,
        drawNumber: String,
        drawDate: Date,
        checkedAt: Date,
      },
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient bond-number searches
PrizeBondSchema.index({ userId: 1, denomination: 1 });
// BUG-08 FIX: Added unique: true to prevent race-condition duplicate inserts
PrizeBondSchema.index({ userId: 1, bondNumber: 1, denomination: 1 }, { unique: true });
PrizeBondSchema.index({ bondNumber: 1, denomination: 1 });
PrizeBondSchema.index({ userId: 1, status: 1 });
PrizeBondSchema.index({ userId: 1, "lastResult.isWinner": 1 });

const PrizeBond: Model<IPrizeBond> =
  mongoose.models.PrizeBond ||
  mongoose.model<IPrizeBond>("PrizeBond", PrizeBondSchema);

export default PrizeBond;
