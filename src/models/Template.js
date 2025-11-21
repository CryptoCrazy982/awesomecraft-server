import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    // ---------- TEMPLATE ID ----------
    templateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    
    // ---------- BASIC INFO ----------
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ---------- SLUG ----------
    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    // ---------- DESCRIPTION ----------
    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    // ---------- CATEGORY RELATION ----------
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // ---------- IMAGES ----------
    images: [imageSchema],

    // ---------- PRICING ----------
    offerPrice: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },

    // ---------- ATTRIBUTES ----------
    productType: [String], // e.g. ["Video Invitation", "E-Card Invitation"]
    dimension: { type: String, enum: ["2D", "3D"], default: "2D" },
    style_tags: [String],
    color_tags: [String],
    editable_level: {
      type: String,
      enum: ["Basic", "Moderate", "Fully Editable"],
      default: "Basic",
    },
    language: [String],

    // ---------- OPTIONS ----------
    includeMapQR: { type: Boolean, default: false },
    physicalDelivery: { type: Boolean, default: false },
    markHighlighted: { type: Boolean, default: false },
    deliveryPrice: { type: Number, default: 0 },

    // ---------- SEO ----------
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    ogImage: { type: String },

    // ---------- TRACKING ----------
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalViews: { type: Number, default: 0 },
    totalDownloads: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Auto-generate slug from title before saving
templateSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

export default mongoose.model("Template", templateSchema);
