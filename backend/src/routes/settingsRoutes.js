import { Router } from "express";
import {
  getAdminSettings,
  getPublicSettings,
  updateSettings
} from "../controllers/settingsController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/public", asyncHandler(getPublicSettings));
router.get("/", requireAdmin, asyncHandler(getAdminSettings));
router.put("/", requireAdmin, asyncHandler(updateSettings));

export default router;
