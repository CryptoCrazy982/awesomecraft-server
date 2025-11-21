import express from "express";
import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController.js";
import { verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

// 🧩 Template Management Routes
router.post("/", verifyAdmin, createTemplate);        // Create new template
router.get("/", verifyAdmin, getAllTemplates);        // Get all templates
router.get("/:id", verifyAdmin, getTemplateById);     // Get single template
router.put("/:id", verifyAdmin, updateTemplate);      // Update template
router.delete("/:id", verifyAdmin, deleteTemplate);   // Delete template

export default router;
