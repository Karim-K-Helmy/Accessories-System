import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getPublicProduct,
  listAdminProducts,
  listPublicProducts,
  updateProduct,
  updateProductStatus
} from "../controllers/productController.js";
import { requireAdmin } from "../middleware/auth.js";
import { productImageUpload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listPublicProducts));
router.get("/admin/all", requireAdmin, asyncHandler(listAdminProducts));
router.get("/:slug", asyncHandler(getPublicProduct));
router.post("/", requireAdmin, productImageUpload, asyncHandler(createProduct));
router.put("/:id", requireAdmin, productImageUpload, asyncHandler(updateProduct));
router.patch("/:id/status", requireAdmin, asyncHandler(updateProductStatus));
router.delete("/:id", requireAdmin, asyncHandler(deleteProduct));

export default router;
