import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    width: { type: Number, min: 1, default: null },
    height: { type: Number, min: 1, default: null },
    focusX: { type: Number, min: 0, max: 100, default: 50 },
    focusY: { type: Number, min: 0, max: 100, default: 50 },
    fit: { type: String, enum: ["cover", "contain"], default: "cover" }
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    price: { type: Number, min: 0, required: true },
    savingsText: { type: String, trim: true, default: "" }
  },
  { _id: true }
);

const colorVariantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    colorHex: {
      type: String,
      required: true,
      trim: true,
      default: "#111827",
      match: /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
    },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, min: 0, default: 0 },
    mainImage: { type: imageSchema, required: true },
    gallery: { type: [imageSchema], default: [] }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 240, default: "" },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, min: 0, default: null },
    currency: { type: String, trim: true, default: "دج" },
    mainImage: { type: imageSchema, required: true },
    gallery: { type: [imageSchema], default: [] },
    banners: { type: [imageSchema], default: [] },
    colorVariants: { type: [colorVariantSchema], default: [] },
    videoUrl: { type: String, trim: true, default: "" },
    features: { type: [String], default: [] },
    offers: { type: [offerSchema], default: [] },
    whatsappNumber: { type: String, trim: true, default: "" },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", shortDescription: "text", description: "text" });

export default mongoose.model("Product", productSchema);
