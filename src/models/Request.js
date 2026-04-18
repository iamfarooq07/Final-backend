import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML', 'Mobile', 'Other'] },
  urgency: { type: String, required: true, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  tags: [{ type: String }],
  status: { type: String, enum: ['open', 'solved'], default: 'open' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  solvedAt: { type: Date }
}, { timestamps: true });

// Index for efficient filtering
requestSchema.index({ category: 1, urgency: 1, status: 1 });
requestSchema.index({ tags: 1 });
requestSchema.index({ userId: 1 });

export default mongoose.model("Request", requestSchema);