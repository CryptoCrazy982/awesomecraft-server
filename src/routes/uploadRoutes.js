import express from "express";
import multer from "multer";
import { verifyAdmin } from "../middlewares/auth.js";
import { uploadToS3 } from "../utils/s3Upload.js";

const router = express.Router();

const storage = multer.memoryStorage();

// Restrict image types and size (1MB)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Invalid file type. Only JPEG, PNG, and WEBP allowed.")
    );
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
  fileFilter,
});

router.post(
  "/category",
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file provided" });

      const url = await uploadToS3(req.file);
      res.status(200).json({
        message: "Upload successful",
        url,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post("/template", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const url = await uploadToS3(req.file, "templates");
    res.status(200).json({
      message: "Upload successful",
      url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
