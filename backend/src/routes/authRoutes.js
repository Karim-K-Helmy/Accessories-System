import { Router } from "express";
import { changePassword, login, me } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", requireAdmin, asyncHandler(me));
router.patch("/change-password", requireAdmin, asyncHandler(changePassword));

export default router;
