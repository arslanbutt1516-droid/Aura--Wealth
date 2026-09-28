import mongoose, { Schema, Document, Model } from "mongoose";

// ─── Chat Session ────────────────────────────────────────────
export interface IChatSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "New Chat",
    },
  },
  { timestamps: true }
);

ChatSessionSchema.index({ userId: 1, createdAt: -1 });

export const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

// ─── Chat Message ────────────────────────────────────────────
export interface IChatMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  message: string;
  toolUsed: string | null;
  toolResult: unknown;
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    toolUsed: {
      type: String,
      default: null,
    },
    toolResult: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
