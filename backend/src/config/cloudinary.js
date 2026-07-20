import { v2 as cloudinary } from "cloudinary";

const PLACEHOLDER_VALUES = new Set([
  "",
  "your_cloud_name",
  "your_api_key",
  "your_api_secret",
  "cloud_name",
  "api_key",
  "api_secret",
]);

function readCloudinaryCredentials() {
  return {
    cloudName: String(process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    apiKey: String(process.env.CLOUDINARY_API_KEY || "").trim(),
    apiSecret: String(process.env.CLOUDINARY_API_SECRET || "").trim(),
  };
}

function isValidCredential(value) {
  return Boolean(value) && !PLACEHOLDER_VALUES.has(value.toLowerCase());
}

export function isCloudinaryConfigured() {
  const { cloudName, apiKey, apiSecret } = readCloudinaryCredentials();

  return (
    isValidCredential(cloudName) &&
    isValidCredential(apiKey) &&
    isValidCredential(apiSecret)
  );
}

export function assertCloudinaryConfigured() {
  if (isCloudinaryConfigured()) {
    return true;
  }

  const error = new Error(
    "Cloudinary is not configured. Add valid CLOUDINARY_CLOUD_NAME, " +
      "CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET values."
  );

  error.code = "CLOUDINARY_NOT_CONFIGURED";
  error.status = 400;
  throw error;
}

export function configureCloudinary() {
  if (!isCloudinaryConfigured()) {
    console.warn(
      "Cloudinary credentials are missing or invalid. " +
        "Image uploads will fail until Cloudinary is configured."
    );
    return false;
  }

  const { cloudName, apiKey, apiSecret } = readCloudinaryCredentials();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log(`Cloudinary configured for cloud: ${cloudName}`);
  return true;
}

export default cloudinary;
