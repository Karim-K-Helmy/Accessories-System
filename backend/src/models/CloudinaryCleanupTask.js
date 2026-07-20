import mongoose from "mongoose";

const cloudinaryCleanupTaskSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, trim: true },
    attempts: { type: Number, min: 0, default: 0 },
    lastError: { type: String, trim: true, default: "" },
    nextAttemptAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

cloudinaryCleanupTaskSchema.index({ nextAttemptAt: 1 });

export default mongoose.model("CloudinaryCleanupTask", cloudinaryCleanupTaskSchema);
