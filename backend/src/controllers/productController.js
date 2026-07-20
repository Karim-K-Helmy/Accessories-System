import Product from "../models/Product.js";
import { deleteCloudinaryImage, uploadBuffer } from "../utils/cloudinaryUpload.js";

function parseJson(value, fieldName, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    const error = new Error(`${fieldName} must contain valid JSON.`);
    error.status = 400;
    throw error;
  }
}

function parseJsonArray(value, fieldName) {
  const parsed = parseJson(value, fieldName, []);
  if (!Array.isArray(parsed)) {
    const error = new Error(`${fieldName} must be a valid JSON array.`);
    error.status = 400;
    throw error;
  }
  return parsed;
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeImageMeta(value = {}) {
  return {
    focusX: clamp(value.focusX, 0, 100, 50),
    focusY: clamp(value.focusY, 0, 100, 50),
    fit: value.fit === "contain" ? "contain" : "cover"
  };
}

function parseImageMeta(value, fieldName) {
  const parsed = parseJson(value, fieldName, {});
  if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
    const error = new Error(`${fieldName} must be a valid JSON object.`);
    error.status = 400;
    throw error;
  }
  return normalizeImageMeta(parsed);
}

function parseImageMetaArray(value, fieldName) {
  return parseJsonArray(value, fieldName).map((item) => ({
    publicId: String(item?.publicId || "").trim(),
    ...normalizeImageMeta(item)
  }));
}

function imageToPlain(image) {
  if (!image) return null;
  return typeof image.toObject === "function" ? image.toObject() : { ...image };
}

function mergeImageMeta(image, meta) {
  return { ...imageToPlain(image), ...normalizeImageMeta(meta) };
}

function normalizeFeatures(value) {
  return parseJsonArray(value, "features")
    .map((feature) => String(feature).trim())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeOffers(value) {
  return parseJsonArray(value, "offers")
    .map((offer) => ({
      label: String(offer.label || "").trim(),
      quantity: Math.max(1, Number(offer.quantity || 1)),
      price: Number(offer.price),
      savingsText: String(offer.savingsText || "").trim()
    }))
    .filter((offer) => offer.label && Number.isFinite(offer.price) && offer.price >= 0)
    .slice(0, 10);
}

function productDataFromBody(body) {
  const name = String(body.name || "").trim();
  const price = Number(body.price);

  if (!name) {
    const error = new Error("Product name is required.");
    error.status = 400;
    throw error;
  }

  if (!Number.isFinite(price) || price < 0) {
    const error = new Error("Product price must be a valid non-negative number.");
    error.status = 400;
    throw error;
  }

  return {
    name,
    shortDescription: String(body.shortDescription || "").trim(),
    description: String(body.description || "").trim(),
    price,
    oldPrice:
      body.oldPrice === "" || body.oldPrice === undefined || body.oldPrice === null
        ? null
        : Number(body.oldPrice),
    currency: String(body.currency || "دج").trim() || "دج",
    videoUrl: String(body.videoUrl || "").trim(),
    whatsappNumber: String(body.whatsappNumber || process.env.DEFAULT_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
    active: String(body.active ?? "true") !== "false",
    features: normalizeFeatures(body.features),
    offers: normalizeOffers(body.offers)
  };
}

function createReadableSlug(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function uniqueSlug(name, requestedSlug, currentProductId = null) {
  const base = createReadableSlug(requestedSlug || name) || `product-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  while (
    await Product.exists({
      slug: candidate,
      ...(currentProductId ? { _id: { $ne: currentProductId } } : {})
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function retainExistingImages(currentImages, requestedImages, fieldName) {
  const current = (currentImages || []).map(imageToPlain);
  const currentMap = new Map(current.map((image) => [image.publicId, image]));
  const retained = [];
  const seen = new Set();

  for (const requested of requestedImages) {
    if (!requested.publicId || seen.has(requested.publicId)) continue;
    const existing = currentMap.get(requested.publicId);
    if (!existing) {
      const error = new Error(`Invalid image supplied in ${fieldName}.`);
      error.status = 400;
      throw error;
    }
    seen.add(requested.publicId);
    retained.push(mergeImageMeta(existing, requested));
  }

  const removed = current.filter((image) => !seen.has(image.publicId));
  return { retained, removed };
}

async function uploadImages(files, metaItems, slug, kind) {
  const uploadedImages = [];
  for (const [index, file] of files.entries()) {
    const uploaded = await uploadBuffer(file.buffer, {
      public_id: `${slug}-${kind}-${index + 1}-${Date.now()}`,
      ...(kind === "banner"
        ? {
            // نحافظ على جودة البانرات الطولية 9:16 بدون قص إجباري.
            transformation: [
              { quality: "auto", fetch_format: "auto" },
              { width: 1440, height: 2560, crop: "limit" }
            ]
          }
        : {})
    });
    uploadedImages.push(mergeImageMeta(uploaded, metaItems[index] || {}));
  }
  return uploadedImages;
}

export async function listPublicProducts(req, res) {
  const products = await Product.find({ active: true })
    .sort({ createdAt: -1 })
    .select("name slug shortDescription price oldPrice currency mainImage features offers whatsappNumber createdAt");

  res.json({ products });
}

export async function getPublicProduct(req, res) {
  const product = await Product.findOne({ slug: req.params.slug, active: true });
  if (!product) return res.status(404).json({ message: "Product not found." });
  res.json({ product });
}

export async function listAdminProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
}

export async function createProduct(req, res) {
  const mainFile = req.files?.mainImage?.[0];
  if (!mainFile) {
    return res.status(400).json({ message: "A main product image is required." });
  }

  const uploadedPublicIds = [];

  try {
    const data = productDataFromBody(req.body);
    data.slug = await uniqueSlug(data.name, req.body.slug);

    const mainUploaded = await uploadBuffer(mainFile.buffer, {
      public_id: `${data.slug}-main-${Date.now()}`
    });
    uploadedPublicIds.push(mainUploaded.publicId);
    const mainImage = mergeImageMeta(mainUploaded, parseImageMeta(req.body.mainImageMeta, "mainImageMeta"));

    const galleryFiles = req.files?.gallery || [];
    const galleryMeta = parseImageMetaArray(req.body.galleryMeta, "galleryMeta");
    const gallery = await uploadImages(galleryFiles, galleryMeta, data.slug, "gallery");
    uploadedPublicIds.push(...gallery.map((image) => image.publicId));

    const bannerFiles = req.files?.banners || [];
    const bannerMeta = parseImageMetaArray(req.body.bannerMeta, "bannerMeta");
    const banners = await uploadImages(bannerFiles, bannerMeta, data.slug, "banner");
    uploadedPublicIds.push(...banners.map((image) => image.publicId));

    const product = await Product.create({ ...data, mainImage, gallery, banners });
    res.status(201).json({ product });
  } catch (error) {
    await Promise.allSettled(uploadedPublicIds.map((publicId) => deleteCloudinaryImage(publicId)));
    throw error;
  }
}

export async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const uploadedPublicIds = [];
  const imagesToDelete = [];

  try {
    const data = productDataFromBody(req.body);
    data.slug = await uniqueSlug(data.name, req.body.slug, product._id);

    let mainImage;
    const newMainFile = req.files?.mainImage?.[0];
    const mainMeta = parseImageMeta(req.body.mainImageMeta, "mainImageMeta");

    if (newMainFile) {
      const uploaded = await uploadBuffer(newMainFile.buffer, {
        public_id: `${data.slug}-main-${Date.now()}`
      });
      uploadedPublicIds.push(uploaded.publicId);
      mainImage = mergeImageMeta(uploaded, mainMeta);
      imagesToDelete.push(product.mainImage.publicId);
    } else {
      mainImage = mergeImageMeta(product.mainImage, mainMeta);
    }

    const currentGallery = (product.gallery || []).map(imageToPlain);
    const requestedGallery = req.body.existingGallery === undefined
      ? currentGallery.map((image) => ({ publicId: image.publicId, ...normalizeImageMeta(image) }))
      : parseImageMetaArray(req.body.existingGallery, "existingGallery");
    const galleryResult = retainExistingImages(currentGallery, requestedGallery, "existingGallery");
    imagesToDelete.push(...galleryResult.removed.map((image) => image.publicId));

    const newGalleryFiles = req.files?.gallery || [];
    const newGalleryMeta = parseImageMetaArray(req.body.galleryMeta, "galleryMeta");
    if (galleryResult.retained.length + newGalleryFiles.length > 8) {
      const error = new Error("A product can contain at most 8 gallery images.");
      error.status = 400;
      throw error;
    }
    const uploadedGallery = await uploadImages(newGalleryFiles, newGalleryMeta, data.slug, "gallery");
    uploadedPublicIds.push(...uploadedGallery.map((image) => image.publicId));
    const gallery = [...galleryResult.retained, ...uploadedGallery];

    const currentBanners = (product.banners || []).map(imageToPlain);
    const requestedBanners = req.body.existingBanners === undefined
      ? currentBanners.map((image) => ({ publicId: image.publicId, ...normalizeImageMeta(image) }))
      : parseImageMetaArray(req.body.existingBanners, "existingBanners");
    const bannerResult = retainExistingImages(currentBanners, requestedBanners, "existingBanners");
    imagesToDelete.push(...bannerResult.removed.map((image) => image.publicId));

    const newBannerFiles = req.files?.banners || [];
    const newBannerMeta = parseImageMetaArray(req.body.bannerMeta, "bannerMeta");
    if (bannerResult.retained.length + newBannerFiles.length > 6) {
      const error = new Error("A product can contain at most 6 banner images.");
      error.status = 400;
      throw error;
    }
    const uploadedBanners = await uploadImages(newBannerFiles, newBannerMeta, data.slug, "banner");
    uploadedPublicIds.push(...uploadedBanners.map((image) => image.publicId));
    const banners = [...bannerResult.retained, ...uploadedBanners];

    Object.assign(product, data, { mainImage, gallery, banners });
    await product.save();

    await Promise.allSettled(imagesToDelete.map((publicId) => deleteCloudinaryImage(publicId)));
    res.json({ product });
  } catch (error) {
    await Promise.allSettled(uploadedPublicIds.map((publicId) => deleteCloudinaryImage(publicId)));
    throw error;
  }
}

export async function updateProductStatus(req, res) {
  const requested = req.body?.active;
  const active = typeof requested === "boolean"
    ? requested
    : String(requested).toLowerCase() === "true";

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: { active } },
    { new: true, runValidators: true }
  );

  if (!product) return res.status(404).json({ message: "Product not found." });

  res.json({
    message: active ? "تم تفعيل المنتج وإظهاره." : "تم تعطيل المنتج وإخفاؤه.",
    product
  });
}

export async function deleteProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const publicIds = [
    product.mainImage?.publicId,
    ...(product.gallery || []).map((image) => image.publicId),
    ...(product.banners || []).map((image) => image.publicId)
  ].filter(Boolean);

  await product.deleteOne();
  await Promise.allSettled(publicIds.map((publicId) => deleteCloudinaryImage(publicId)));
  res.json({ message: "Product deleted." });
}
