import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: String },
  lastMessageTime: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
