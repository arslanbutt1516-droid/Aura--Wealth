import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityType =
  | "account_created"
  | "login"
  | "logout"
  | "bond_added"
  | "bond_edited"
  | "bond_deleted"
  | "bond_checked"
  | "bond_scanned"
  | "currency_converted"
  | "ai_question"
  | "notification_sent"
  | "profile_updated"
  | "settings_updated"
  | "alert_created"
  | "alert_deleted";

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: ActivityType;
  description: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    // Only createdAt needed
    toJSON: { virtuals: false },
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, type: 1, createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
