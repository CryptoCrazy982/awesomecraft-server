import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

/* 
  ✅ Public Routes
  These routes are safe to expose — no modification allowed
*/

// Get all categories (public)
router.get("/", getCategories);

// Get category by ID (public)
router.get("/:id", getCategoryById);

/* 
  🔒 Admin Routes
  Protected actions (create, update, delete)
*/

router.post("/", verifyAdmin, createCategory);
router.put("/:id", verifyAdmin, updateCategory);
router.delete("/:id", verifyAdmin, deleteCategory);

export default router;
