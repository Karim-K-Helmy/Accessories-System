import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "store",
      unique: true,
      immutable: true
    },
    storeName: {
      type: String,
      default: "متجر الإكسسوارات",
      trim: true,
      maxlength: 80
    },
    storeTagline: {
      type: String,
      default: "اختيارات موثوقة وخدمة سهلة",
      trim: true,
      maxlength: 140
    },
    storeDescription: {
      type: String,
      default: "نوفر منتجات مختارة بعناية، مع طلب مباشر وسهل عبر واتساب.",
      trim: true,
      maxlength: 800
    },
    storeAddress: {
      type: String,
      default: "",
      trim: true,
      maxlength: 220
    },
    whatsappNumber: {
      type: String,
      default: "",
      trim: true
    },
    headerPhoneNumber: {
      type: String,
      default: "",
      trim: true
    },
    themeMode: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    }
  },
  { timestamps: true }
);

export default mongoose.model("StoreSettings", storeSettingsSchema);
