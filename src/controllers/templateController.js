import Template from "../models/Template.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3Upload.js";


// ==================================================
//  CREATE TEMPLATE
// ==================================================
export const createTemplate = async (req, res) => {
  try {
    const {
      templateId,
      title,
      categories,
      offerPrice,
      salePrice,
      discount,
      description,
      images,
      style_tags,
      color_tags,
      productType,
      dimension,
      editable_level,
      language,
      includeMapQR,
      physicalDelivery,
      markHighlighted,
      deliveryPrice,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      status,
    } = req.body;

    // Required checks
    if (!templateId) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    if (!title || !images || !images.length) {
      return res.status(400).json({ message: "Title and at least one image are required" });
    }

    // Check if Template ID already exists
    const exists = await Template.findOne({ templateId });
    if (exists) {
      return res.status(400).json({ message: "Template ID already exists. Use a different one." });
    }

    // Calculate discount
    const computedDiscount =
      discount && !isNaN(discount)
        ? discount
        : offerPrice && salePrice
        ? Math.round(((offerPrice - salePrice) / offerPrice) * 100)
        : 0;

    const level =
      editable_level && editable_level.trim() !== "" ? editable_level : "Basic";

    // Create template
    const template = new Template({
      templateId,
      title,
      categories,
      offerPrice: Number(offerPrice),
      salePrice: Number(salePrice),
      discount: Number(computedDiscount),
      description,
      images,
      style_tags,
      color_tags,
      productType,
      dimension,
      editable_level: level,
      language,
      includeMapQR,
      physicalDelivery,
      markHighlighted,
      deliveryPrice: Number(deliveryPrice) || 0,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      status,
      createdBy: req.user?._id,
    });

    await template.save();

    const mainImageUrl =
      images.find((img) => img.isMain)?.url || images[0]?.url;

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: { ...template.toObject(), mainImageUrl },
    });

  } catch (err) {
    console.error("❌ Template creation failed:", err);

    // Duplicate key (MongoDB unique index)
    if (err.code === 11000 && err.keyPattern?.templateId) {
      return res.status(400).json({ message: "Template ID already exists." });
    }

    res.status(500).json({ message: err.message });
  }
};



// ==================================================
//  GET ALL TEMPLATES (WITH SEARCH, FILTER, SORT, PAGINATION)
// ==================================================
export const getAllTemplates = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      templateId,
      title,
      category,
      status,
      sortField = "createdAt",
      sortOrder = "desc",
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    // ---- Construct Query ----
    const query = {};

    // Search by templateId
    if (templateId) {
      query.templateId = { $regex: templateId, $options: "i" };
    }

    // Search by title
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    // Filter by category
    if (category) {
      query.categories = category;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // ---- Sorting ----
    const sort = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // ---- Count ----
    const total = await Template.countDocuments(query);

    // ---- Fetch Templates ----
    const templates = await Template.find(query)
      .populate("categories", "name")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // ---- Add main image ----
    const list = templates.map((tpl) => ({
      ...tpl,
      mainImageUrl:
        tpl.images?.find((img) => img.isMain)?.url ||
        tpl.previewImage ||
        tpl.images?.[0]?.url ||
        null,
    }));

    // ---- Final Response ----
    res.json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      templates: list,
    });

  } catch (err) {
    console.error("❌ Error fetching templates:", err.message);
    res.status(500).json({ message: "Server error fetching templates" });
  }
};




// ==================================================
//  GET SINGLE TEMPLATE
// ==================================================
export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate("categories", "name")
      .lean();

    if (!template)
      return res.status(404).json({ message: "Template not found" });

    template.mainImageUrl =
      template.images?.find((img) => img.isMain)?.url ||
      template.previewImage ||
      template.images?.[0]?.url ||
      null;

    res.json(template);

  } catch (err) {
    console.error("❌ Error fetching single template:", err.message);
    res.status(500).json({ message: "Server error fetching template" });
  }
};



// ==================================================
//  UPDATE TEMPLATE
// ==================================================
export const updateTemplate = async (req, res) => {
  try {
    const {
      templateId,
      title,
      categories,
      offerPrice,
      salePrice,
      discount,
      description,
      images,
      style_tags,
      color_tags,
      productType,
      dimension,
      editable_level,
      language,
      includeMapQR,
      physicalDelivery,
      markHighlighted,
      deliveryPrice,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      status,
    } = req.body;

    // Check duplicate Template ID (when editing)
    if (templateId) {
      const exists = await Template.findOne({
        templateId,
        _id: { $ne: req.params.id }, // ignore current document
      });

      if (exists) {
        return res.status(400).json({
          message: "Template ID already exists. Use a different one.",
        });
      }
    }

    const computedDiscount =
      discount && !isNaN(discount)
        ? discount
        : offerPrice && salePrice
        ? Math.round(((offerPrice - salePrice) / offerPrice) * 100)
        : 0;

    const level =
      editable_level && editable_level.trim() !== "" ? editable_level : "Basic";

    const updateData = {
      templateId,
      title,
      categories,
      offerPrice: Number(offerPrice),
      salePrice: Number(salePrice),
      discount: Number(computedDiscount),
      description,
      images,
      style_tags,
      color_tags,
      productType,
      dimension,
      editable_level: level,
      language,
      includeMapQR,
      physicalDelivery,
      markHighlighted,
      deliveryPrice: Number(deliveryPrice) || 0,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      status,
    };

    const updated = await Template.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("categories", "name")
      .lean();

    if (!updated)
      return res.status(404).json({ message: "Template not found" });

    updated.mainImageUrl =
      updated.images?.find((img) => img.isMain)?.url ||
      updated.previewImage ||
      updated.images?.[0]?.url ||
      null;

    res.json({
      success: true,
      message: "Template updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error("❌ Template update failed:", err);

    if (err.code === 11000 && err.keyPattern?.templateId) {
      return res.status(400).json({ message: "Template ID already exists." });
    }

    res.status(500).json({ message: err.message });
  }
};



// ==================================================
//  DELETE TEMPLATE
// ==================================================
export const deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template)
      return res.status(404).json({ message: "Template not found" });

    // Delete images from S3
    if (template.images?.length) {
      for (const img of template.images) {
        try {
          await deleteFromS3(img.url);
        } catch (err) {
          console.warn("⚠️ Failed to delete image from S3:", err.message);
        }
      }
    }

    await Template.findByIdAndDelete(req.params.id);

    res.json({ message: "Template deleted successfully" });

  } catch (err) {
    console.error("❌ Error deleting template:", err.message);
    res.status(500).json({ message: "Server error deleting template" });
  }
};
