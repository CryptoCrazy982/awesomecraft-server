import express from "express";
import { getBanners, addBanner, deleteBanner } from "../controllers/bannerController.js";
import { verifyAdmin } from "../middlewares/auth.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public route for frontend
router.get("/", getBanners);

// Admin routes
router.post("/", verifyAdmin, upload.single("bg"), addBanner);
router.delete("/:id", verifyAdmin, deleteBanner);

export default router;
