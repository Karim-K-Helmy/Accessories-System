import multer from "multer";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

const storage = multer.memoryStorage();

function fileFilter(req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(new Error("Only JPG, PNG, WEBP, and AVIF images are allowed."));
  }
  callback(null, true);
}

export const productImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 110,
    fields: 90,
    parts: 220
  }
}).fields([
  { name: "banners", maxCount: 6 },
  { name: "variantMainImages", maxCount: 16 },
  { name: "variantGalleryImages", maxCount: 80 }
]);
