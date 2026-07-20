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
    // الحد لكل صورة منفردة. البانرات الطولية قد تكون عالية الدقة.
    fileSize: 20 * 1024 * 1024,
    files: 15,
    fields: 40,
    parts: 60
  }
}).fields([
  { name: "mainImage", maxCount: 1 },
  { name: "gallery", maxCount: 8 },
  { name: "banners", maxCount: 6 }
]);
