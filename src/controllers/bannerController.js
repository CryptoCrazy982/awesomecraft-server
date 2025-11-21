import Banner from "../models/Banner.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";

// ✅ Get all active banners
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Add new banner (Admin)
export const addBanner = async (req, res) => {
  try {
    const { title, subtitle, desc, cta, link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Banner image is required" });
    }

    // Upload to S3 in "banners" folder
    const s3Url = await uploadToS3(req.file, "banners");

    const banner = await Banner.create({
      title,
      subtitle,
      desc,
      cta,
      link,
      bg: s3Url,
    });

    res.status(201).json(banner);
  } catch (err) {
    console.error("Error adding banner:", err);
    res.status(400).json({ message: err.message });
  }
};

// ✅ Delete banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Remove from S3
    await deleteFromS3(banner.bg);

    // Remove from DB
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({ message: err.message });
  }
};
