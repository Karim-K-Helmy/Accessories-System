import { Readable } from "node:stream";
import cloudinary, { assertCloudinaryConfigured } from "../config/cloudinary.js";

export function uploadBuffer(buffer, options = {}) {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "mobile-accessories-store",
        resource_type: "image",
        // Keep the original dimensions and quality. Display sizing is handled by CSS.
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        });
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

export async function deleteCloudinaryImage(publicId) {
  if (!publicId) return;
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
