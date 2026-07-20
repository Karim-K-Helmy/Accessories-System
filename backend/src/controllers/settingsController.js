import StoreSettings from "../models/StoreSettings.js";

const SETTINGS_KEY = "store";
const DEFAULT_STORE_NAME = "متجر الإكسسوارات";
const DEFAULT_TAGLINE = "اختيارات موثوقة وخدمة سهلة";
const DEFAULT_DESCRIPTION = "نوفر منتجات مختارة بعناية، مع طلب مباشر وسهل عبر واتساب.";

function cleanPhoneNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function normalizeTheme(value) {
  return value === "dark" ? "dark" : "light";
}

async function getOrCreateSettings() {
  const fallbackNumber = cleanPhoneNumber(process.env.DEFAULT_WHATSAPP_NUMBER);

  return StoreSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $setOnInsert: {
        key: SETTINGS_KEY,
        storeName: DEFAULT_STORE_NAME,
        storeTagline: DEFAULT_TAGLINE,
        storeDescription: DEFAULT_DESCRIPTION,
        storeAddress: "",
        whatsappNumber: fallbackNumber,
        headerPhoneNumber: fallbackNumber,
        themeMode: "light"
      }
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );
}

function publicSettings(settings) {
  return {
    storeName: settings.storeName || DEFAULT_STORE_NAME,
    storeTagline: settings.storeTagline || DEFAULT_TAGLINE,
    storeDescription: settings.storeDescription || DEFAULT_DESCRIPTION,
    storeAddress: settings.storeAddress || "",
    whatsappNumber: settings.whatsappNumber || "",
    headerPhoneNumber: settings.headerPhoneNumber || settings.whatsappNumber || "",
    themeMode: normalizeTheme(settings.themeMode)
  };
}

export async function getPublicSettings(req, res) {
  const settings = await getOrCreateSettings();
  res.json({ settings: publicSettings(settings) });
}

export async function getAdminSettings(req, res) {
  const settings = await getOrCreateSettings();
  res.json({
    settings: {
      ...settings.toObject(),
      ...publicSettings(settings)
    }
  });
}

export async function updateSettings(req, res) {
  const storeName = cleanText(req.body.storeName, 80) || DEFAULT_STORE_NAME;
  const storeTagline = cleanText(req.body.storeTagline, 140);
  const storeDescription = cleanText(req.body.storeDescription, 800);
  const storeAddress = cleanText(req.body.storeAddress, 220);
  const whatsappNumber = cleanPhoneNumber(req.body.whatsappNumber);
  const headerPhoneNumber = cleanPhoneNumber(req.body.headerPhoneNumber);
  const themeMode = normalizeTheme(req.body.themeMode);

  if (whatsappNumber && whatsappNumber.length < 8) {
    return res.status(400).json({
      message: "رقم واتساب غير صحيح. اكتب الرقم كاملًا مع كود الدولة وبدون علامة +."
    });
  }

  if (headerPhoneNumber && headerPhoneNumber.length < 8) {
    return res.status(400).json({
      message: "رقم خدمة العملاء غير صحيح. اكتب الرقم كاملًا مع كود الدولة وبدون علامة +."
    });
  }

  const settings = await StoreSettings.findOneAndUpdate(
    { key: SETTINGS_KEY },
    {
      $set: {
        storeName,
        storeTagline,
        storeDescription,
        storeAddress,
        whatsappNumber,
        headerPhoneNumber,
        themeMode
      },
      $setOnInsert: {
        key: SETTINGS_KEY
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  res.json({
    message: "تم حفظ إعدادات المتجر بنجاح.",
    settings: {
      ...settings.toObject(),
      ...publicSettings(settings)
    }
  });
}
