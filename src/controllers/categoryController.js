import Category from "../models/Category.js";
import slugify from "slugify";
import { deleteFromS3 } from "../utils/s3Upload.js";

// ✅ CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory, highlighted } = req.body;

    if (!name)
      return res.status(400).json({ message: "Category name is required" });

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parentCategory: parentCategory || null,
      highlighted: highlighted || false,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error("❌ Category creation failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL CATEGORIES (returns flat array with parentCategory as ObjectId)
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    console.error("❌ Error fetching categories:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET SINGLE CATEGORY
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    console.error("❌ Error fetching category:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE CATEGORY (with S3 cleanup)
export const updateCategory = async (req, res) => {
  try {
    // 🧩 FIX: Include 'highlighted' in destructuring
    const {
      name,
      description,
      image,
      isActive,
      parentCategory,
      highlighted,
    } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // 🧹 Delete old image from S3 if a new one is uploaded
    if (image && category.image && image !== category.image) {
      try {
        await deleteFromS3(category.image);
        console.log(`🧾 Old category image deleted: ${category.image}`);
      } catch (err) {
        console.warn("⚠️ Failed to delete old image from S3:", err.message);
      }
    }

    // 🧱 Generate new slug only if name changed
    const slug =
      name && name !== category.name
        ? slugify(name, { lower: true, strict: true })
        : category.slug;

    category.name = name || category.name;
    category.slug = slug;
    category.description = description || category.description;
    category.image = image || category.image;
    category.isActive =
      typeof isActive === "boolean" ? isActive : category.isActive;
    category.parentCategory = parentCategory || null;

    // ✅ Highlighted now updates properly (including unchecking)
    category.highlighted =
      typeof highlighted === "boolean" ? highlighted : category.highlighted;

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    console.error("❌ Category update failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE CATEGORY (with S3 cleanup + hierarchy restriction)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // 🧩 Prevent deleting category with subcategories
    const childCategories = await Category.find({ parentCategory: id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete this category. Please delete or reassign its subcategories first.",
      });
    }

    // 🧹 Delete image from S3 if present
    if (category.image) {
      try {
        await deleteFromS3(category.image);
        console.log(`🧾 Deleted category image from S3: ${category.image}`);
      } catch (err) {
        console.warn("⚠️ Failed to delete category image:", err.message);
      }
    }

    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted successfully." });
  } catch (err) {
    console.error("❌ Category deletion failed:", err.message);
    res.status(500).json({ message: err.message });
  }
};
