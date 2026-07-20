import Product from "../models/Product.js";
import { uploadBuffer } from "../utils/cloudinaryUpload.js";
import { deleteCloudinaryImagesSafely } from "../services/cloudinaryCleanupService.js";

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

  if (!name) {
    const error = new Error("Product name is required.");
    error.status = 400;
    throw error;
  }

  return {
    name,
    shortDescription: String(body.shortDescription || "").trim(),
    description: String(body.description || "").trim(),
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

function normalizeColorHex(value) {
  const raw = String(value || "").trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(raw)) return raw;
  return "#111827";
}

function parseColorVariants(value) {
  const variants = parseJsonArray(value, "colorVariants")
    .map((variant, index) => ({
      clientId: String(variant.clientId || `variant-${index + 1}`),
      name: String(variant.name || "").trim(),
      colorHex: normalizeColorHex(variant.colorHex),
      price: Number(variant.price),
      oldPrice:
        variant.oldPrice === "" || variant.oldPrice === undefined || variant.oldPrice === null
          ? null
          : Number(variant.oldPrice),
      stock: Math.max(0, Math.round(Number(variant.stock ?? 0) || 0)),
      existingMainImage:
        variant.existingMainImage && typeof variant.existingMainImage === "object"
          ? {
              publicId: String(variant.existingMainImage.publicId || "").trim(),
              ...normalizeImageMeta(variant.existingMainImage)
            }
          : null,
      existingGallery: Array.isArray(variant.existingGallery)
        ? variant.existingGallery.map((item) => ({
            publicId: String(item?.publicId || "").trim(),
            ...normalizeImageMeta(item)
          }))
        : [],
      mainImageSlot: Number.isInteger(Number(variant.mainImageSlot)) ? Number(variant.mainImageSlot) : -1,
      mainImageMeta: normalizeImageMeta(variant.mainImageMeta || {}),
      newGallerySlots: Array.isArray(variant.newGallerySlots)
        ? variant.newGallerySlots
            .map((slot) => Number(slot))
            .filter((slot) => Number.isInteger(slot) && slot >= 0)
        : [],
      newGalleryMeta: Array.isArray(variant.newGalleryMeta)
        ? variant.newGalleryMeta.map((item) => normalizeImageMeta(item))
        : []
    }))
    .filter((variant) => variant.name)
    .slice(0, 16);

  if (!variants.length) {
    const error = new Error("Add at least one product color.");
    error.status = 400;
    throw error;
  }

  return variants;
}

function normalizeBannerMeta(value) {
  return parseJsonArray(value, "existingBanners").map((item) => ({
    publicId: String(item?.publicId || "").trim(),
    ...normalizeImageMeta(item)
  }));
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

  return retained;
}

async function uploadImages(files, metaItems, slug, kind) {
  const uploadedImages = [];
  for (const [index, file] of files.entries()) {
    const uploaded = await uploadBuffer(file.buffer, {
      public_id: `${slug}-${kind}-${index + 1}-${Date.now()}`,
      ...(kind === "banner"
        ? {
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

function collectCurrentImageCandidates(product) {
  const images = [
    product?.mainImage,
    ...(product?.gallery || []),
    ...(product?.colorVariants || []).map((variant) => variant.mainImage),
    ...(product?.colorVariants || []).flatMap((variant) => variant.gallery || [])
  ]
    .map(imageToPlain)
    .filter(Boolean);

  return new Map(images.map((image) => [image.publicId, image]));
}

function collectProductPublicIds(product) {
  return [
    product?.mainImage?.publicId,
    ...(product?.gallery || []).map((image) => image.publicId),
    ...(product?.banners || []).map((image) => image.publicId),
    ...(product?.colorVariants || []).map((variant) => variant.mainImage?.publicId),
    ...(product?.colorVariants || []).flatMap((variant) =>
      (variant.gallery || []).map((image) => image.publicId)
    )
  ].filter(Boolean);
}

async function buildColorVariants({ slug, requestedVariants, variantMainFiles, variantGalleryFiles, currentProduct }) {
  const candidateMap = collectCurrentImageCandidates(currentProduct);
  const nextVariants = [];
  const uploadedPublicIds = [];

  for (const [index, variant] of requestedVariants.entries()) {
    if (!Number.isFinite(variant.price) || variant.price < 0) {
      const error = new Error(`Invalid price for color ${variant.name}.`);
      error.status = 400;
      throw error;
    }

    if (variant.existingGallery.length + variant.newGallerySlots.length > 8) {
      const error = new Error(`Color ${variant.name} can contain at most 8 gallery images.`);
      error.status = 400;
      throw error;
    }

    let mainImage;

    if (variant.mainImageSlot >= 0) {
      const file = variantMainFiles[variant.mainImageSlot];
      if (!file) {
        const error = new Error(`Main image is missing for color ${variant.name}.`);
        error.status = 400;
        throw error;
      }

      const uploaded = await uploadBuffer(file.buffer, {
        public_id: `${slug}-color-${createReadableSlug(variant.name) || index + 1}-main-${Date.now()}`
      });
      uploadedPublicIds.push(uploaded.publicId);
      mainImage = mergeImageMeta(uploaded, variant.mainImageMeta);
    } else if (variant.existingMainImage?.publicId) {
      const existing = candidateMap.get(variant.existingMainImage.publicId);
      if (!existing) {
        const error = new Error(`Invalid existing main image for color ${variant.name}.`);
        error.status = 400;
        throw error;
      }
      mainImage = mergeImageMeta(existing, variant.existingMainImage);
    } else {
      const error = new Error(`Each color must include a main image. Missing in ${variant.name}.`);
      error.status = 400;
      throw error;
    }

    const retainedGallery = [];
    const seenGallery = new Set();

    for (const item of variant.existingGallery) {
      if (!item.publicId || seenGallery.has(item.publicId)) continue;
      const existing = candidateMap.get(item.publicId);
      if (!existing) {
        const error = new Error(`Invalid existing gallery image for color ${variant.name}.`);
        error.status = 400;
        throw error;
      }
      seenGallery.add(item.publicId);
      retainedGallery.push(mergeImageMeta(existing, item));
    }

    const uploadedGallery = [];
    for (const [galleryIndex, slot] of variant.newGallerySlots.entries()) {
      const file = variantGalleryFiles[slot];
      if (!file) {
        const error = new Error(`Gallery image is missing for color ${variant.name}.`);
        error.status = 400;
        throw error;
      }

      const uploaded = await uploadBuffer(file.buffer, {
        public_id: `${slug}-color-${createReadableSlug(variant.name) || index + 1}-gallery-${uploadedGallery.length + 1}-${Date.now()}`
      });
      uploadedPublicIds.push(uploaded.publicId);
      uploadedGallery.push(mergeImageMeta(uploaded, variant.newGalleryMeta[galleryIndex] || {}));
    }

    nextVariants.push({
      name: variant.name,
      colorHex: variant.colorHex,
      price: variant.price,
      oldPrice: variant.oldPrice,
      stock: variant.stock,
      mainImage,
      gallery: [...retainedGallery, ...uploadedGallery]
    });
  }

  return { nextVariants, uploadedPublicIds };
}

export async function listPublicProducts(req, res) {
  const products = await Product.find({ active: true })
    .sort({ createdAt: -1 })
    .select("name slug shortDescription price oldPrice currency mainImage features offers whatsappNumber colorVariants createdAt");

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
  const uploadedPublicIds = [];

  try {
    const data = productDataFromBody(req.body);
    data.slug = await uniqueSlug(data.name, req.body.slug);

    const requestedVariants = parseColorVariants(req.body.colorVariants);
    const variantsResult = await buildColorVariants({
      slug: data.slug,
      requestedVariants,
      variantMainFiles: req.files?.variantMainImages || [],
      variantGalleryFiles: req.files?.variantGalleryImages || [],
      currentProduct: null
    });
    uploadedPublicIds.push(...variantsResult.uploadedPublicIds);

    const bannerFiles = req.files?.banners || [];
    const bannerMeta = parseJsonArray(req.body.bannerMeta, "bannerMeta").map(normalizeImageMeta);
    if (bannerFiles.length > 6) {
      const error = new Error("A product can contain at most 6 additional images.");
      error.status = 400;
      throw error;
    }
    const banners = await uploadImages(bannerFiles, bannerMeta, data.slug, "banner");
    uploadedPublicIds.push(...banners.map((image) => image.publicId));

    const firstVariant = variantsResult.nextVariants[0];
    const product = await Product.create({
      ...data,
      price: firstVariant.price,
      oldPrice: firstVariant.oldPrice,
      mainImage: firstVariant.mainImage,
      gallery: firstVariant.gallery,
      banners,
      colorVariants: variantsResult.nextVariants
    });

    res.status(201).json({ product });
  } catch (error) {
    await deleteCloudinaryImagesSafely(uploadedPublicIds);
    throw error;
  }
}

export async function updateProduct(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found." });

  const uploadedPublicIds = [];
  const currentPublicIds = new Set(collectProductPublicIds(product));

  try {
    const data = productDataFromBody(req.body);
    data.slug = await uniqueSlug(data.name, req.body.slug, product._id);

    const requestedVariants = parseColorVariants(req.body.colorVariants);
    const variantsResult = await buildColorVariants({
      slug: data.slug,
      requestedVariants,
      variantMainFiles: req.files?.variantMainImages || [],
      variantGalleryFiles: req.files?.variantGalleryImages || [],
      currentProduct: product
    });
    uploadedPublicIds.push(...variantsResult.uploadedPublicIds);

    const currentBanners = (product.banners || []).map(imageToPlain);
    const requestedBanners = req.body.existingBanners === undefined
      ? currentBanners.map((image) => ({ publicId: image.publicId, ...normalizeImageMeta(image) }))
      : normalizeBannerMeta(req.body.existingBanners);
    const retainedBanners = retainExistingImages(currentBanners, requestedBanners, "existingBanners");

    const newBannerFiles = req.files?.banners || [];
    const newBannerMeta = parseJsonArray(req.body.bannerMeta, "bannerMeta").map(normalizeImageMeta);
    if (retainedBanners.length + newBannerFiles.length > 6) {
      const error = new Error("A product can contain at most 6 additional images.");
      error.status = 400;
      throw error;
    }

    const uploadedBanners = await uploadImages(newBannerFiles, newBannerMeta, data.slug, "banner");
    uploadedPublicIds.push(...uploadedBanners.map((image) => image.publicId));
    const banners = [...retainedBanners, ...uploadedBanners];

    const firstVariant = variantsResult.nextVariants[0];
    Object.assign(product, data, {
      price: firstVariant.price,
      oldPrice: firstVariant.oldPrice,
      mainImage: firstVariant.mainImage,
      gallery: firstVariant.gallery,
      banners,
      colorVariants: variantsResult.nextVariants
    });

    await product.save();

    const nextPublicIds = new Set(collectProductPublicIds(product));
    const imagesToDelete = [...currentPublicIds].filter((publicId) => !nextPublicIds.has(publicId));
    const cleanup = await deleteCloudinaryImagesSafely(imagesToDelete);

    res.json({
      product,
      cleanup: {
        deleted: cleanup.deleted.length,
        queued: cleanup.queued.length
      }
    });
  } catch (error) {
    await deleteCloudinaryImagesSafely(uploadedPublicIds);
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

  const publicIds = [...new Set(collectProductPublicIds(product))];
  await product.deleteOne();

  const cleanup = await deleteCloudinaryImagesSafely(publicIds);

  res.json({
    message: cleanup.queued.length
      ? "Product deleted. Some Cloudinary images were queued for automatic retry."
      : "Product and all Cloudinary images deleted.",
    cleanup: {
      deleted: cleanup.deleted.length,
      queued: cleanup.queued.length
    }
  });
}
