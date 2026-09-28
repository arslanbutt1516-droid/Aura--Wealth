import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  passwordHash: string;
  preferredCurrency: string;
  favoriteCurrencies: string[];
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    whatsapp: boolean;
    prizeWin: boolean;
    upcomingDraw: boolean;
    drawResult: boolean;
    currencyAlert: boolean;
    accountActivity: boolean;
  };
  role: "user" | "admin";
  isVerified: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    whatsappNumber: {
      type: String,
      trim: true,
      default: "",
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    preferredCurrency: {
      type: String,
      default: "PKR",
      uppercase: true,
    },
    favoriteCurrencies: {
      type: [String],
      default: ["USD", "EUR", "GBP", "AED", "SAR"],
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      prizeWin: { type: Boolean, default: true },
      upcomingDraw: { type: Boolean, default: true },
      drawResult: { type: Boolean, default: true },
      currencyAlert: { type: Boolean, default: true },
      accountActivity: { type: Boolean, default: false },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
