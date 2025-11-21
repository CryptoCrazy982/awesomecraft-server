import express from "express";
import { getPublicTemplates, getPublicTemplateById, searchPublicTemplates } from "../controllers/publicTemplateController.js";

const router = express.Router();

router.get("/", getPublicTemplates);
router.get("/search", searchPublicTemplates);
router.get("/:id", getPublicTemplateById);

export default router;
