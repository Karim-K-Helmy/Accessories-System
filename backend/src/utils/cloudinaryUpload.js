import { Readable } from "node:stream";
import cloudinary from "../config/cloudinary.js";

export function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "mobile-accessories-store",
        resource_type: "image",
        transformation: [
          { quality: "auto", fetch_format: "auto" },
          { width: 1600, height: 1600, crop: "limit" }
        ],
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height });
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
