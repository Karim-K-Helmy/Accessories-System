export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({ message: "A record with the same unique value already exists." });
  }

  if (error.name === "MulterError") {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "حجم الصورة كبير جدًا. الحد الأقصى 20MB لكل صورة.",
        field: error.field || null
      });
    }

    if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "عدد الصور أكبر من المسموح. الحد: صورة رئيسية واحدة، و8 صور للمعرض، و6 صور إضافية.",
        field: error.field || null
      });
    }

    return res.status(400).json({ message: error.message, field: error.field || null });
  }

  const cloudinaryMessage = String(error?.message || "");
  if (
    error?.code === "CLOUDINARY_NOT_CONFIGURED" ||
    error?.http_code === 401 ||
    /unknown api key|invalid signature|cloudinary/i.test(cloudinaryMessage)
  ) {
    return res.status(400).json({
      message:
        error?.code === "CLOUDINARY_NOT_CONFIGURED"
          ? cloudinaryMessage
          : "رفض Cloudinary بيانات الحساب. راجع CLOUDINARY_CLOUD_NAME وCLOUDINARY_API_KEY وCLOUDINARY_API_SECRET داخل backend/.env، ثم أعد تشغيل الـBackend."
    });
  }

  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? "An unexpected server error occurred." : error.message
  });
}
