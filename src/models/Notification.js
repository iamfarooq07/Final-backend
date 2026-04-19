import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['request', 'help', 'system', 'update', 'achievement'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Reference to request, help, etc.
  icon: { type: String },
  actionUrl: { type: String }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
