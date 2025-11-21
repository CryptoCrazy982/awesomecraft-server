import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    desc: { type: String },
    cta: { type: String },
    link: { type: String },
    bg: { type: String, required: true }, // S3 URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
