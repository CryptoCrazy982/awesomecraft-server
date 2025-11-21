import Template from "../models/Template.js";
import Category from "../models/Category.js";

/**
 * GET /api/public/templates
 * Supports query:
 *  - categorySlug, categoryName
 *  - style (single or comma separated)
 *  - color (single or comma separated)
 *  - language (single or comma separated)
 *  - editableLevel
 *  - productType (single or comma separated)
 *  - dimension
 *  - minPrice, maxPrice
 *  - sort (price_asc, price_desc, name_asc, name_desc)
 *  - page, limit (optional paging)
 */
export const getPublicTemplates = async (req, res) => {
  try {
    const {
      categoryName,
      categorySlug,
      style,
      color,
      language,
      editableLevel,
      productType,
      dimension,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    } = req.query;

    const filter = { status: "Active" };

    // category by slug or name
    if (categorySlug || categoryName) {
      const category = await Category.findOne({
        $or: [{ slug: categorySlug }, { name: categoryName }],
      }).lean();

      if (category) {
        if (!category.parentCategory) {
          // 🔥 Parent category: fetch all subcategories
          const subCategories = await Category.find({
            parentCategory: category._id,
          }).lean();

          if (subCategories.length > 0) {
            // collect subcategory IDs
            const subCategoryIds = subCategories.map((c) => c._id);

            // include parent ID as well (optional)
            subCategoryIds.push(category._id);

            // APPLY → find templates where categories contain ANY of these
            filter.categories = { $in: subCategoryIds };
          } else {
            // No subcategories → treat as normal single category
            filter.categories = category._id;
          }
        } else {
          // 🔥 Subcategory → direct match
          filter.categories = category._id;
        }
      }
    }

    // helper to convert comma separated values into array
    const toArray = (v) =>
      !v
        ? []
        : Array.isArray(v)
        ? v
        : String(v)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

    // style -> matches style_tags array (exact string or case-insensitive)
    const styleArr = toArray(style);
    if (styleArr.length) {
      filter.style_tags = {
        $in: styleArr.map((s) => new RegExp(`^${escapeRegExp(s)}$`, "i")),
      };
    }

    // color -> matches color_tags array
    const colorArr = toArray(color);
    if (colorArr.length) {
      filter.color_tags = {
        $in: colorArr.map((c) => new RegExp(escapeRegExp(c), "i")),
      };
    }

    // language -> matches language array
    const languageArr = toArray(language);
    if (languageArr.length) {
      filter.language = {
        $in: languageArr.map((l) => new RegExp(escapeRegExp(l), "i")),
      };
    }

    // editableLevel (string)
    if (editableLevel) {
      filter.editable_level = new RegExp(
        `^${escapeRegExp(editableLevel)}$`,
        "i"
      );
    }

    // productType -> matches productType array
    const typeArr = toArray(productType);
    if (typeArr.length) {
      filter.productType = {
        $in: typeArr.map((t) => new RegExp(escapeRegExp(t), "i")),
      };
    }

    // dimension (2D/3D)
    if (dimension) {
      filter.dimension = new RegExp(`^${escapeRegExp(dimension)}$`, "i");
    }

    // price range
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) filter.salePrice.$gte = Number(minPrice);
      if (maxPrice) filter.salePrice.$lte = Number(maxPrice);
    }

    // sorting
    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { salePrice: 1 };
    if (sort === "price_desc") sortOption = { salePrice: -1 };
    if (sort === "name_asc") sortOption = { title: 1 };
    if (sort === "name_desc") sortOption = { title: -1 };

    // pagination (optional)
    const pageNum = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 100); // default 100 to keep results usable for frontend filtering

    // fetch
    const templates = await Template.find(filter)
      .populate("categories", "name slug")
      .sort(sortOption)
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .lean();

    const formatted = templates.map((tpl) => ({
      ...tpl,
      mainImageUrl:
        tpl.images?.find((img) => img.isMain)?.url ||
        tpl.images?.[0]?.url ||
        null,
    }));

    res.json({ success: true, count: formatted.length, templates: formatted });
  } catch (error) {
    console.error("❌ Public template fetch failed:", error.message);
    res.status(500).json({ message: "Server error fetching templates" });
  }
};

// fetch by id or slug (unchanged)
export const getPublicTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    let template;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (isObjectId) {
      template = await Template.findById(id)
        .populate("categories", "name slug")
        .lean();
    } else {
      template = await Template.findOne({ slug: id })
        .populate("categories", "name slug")
        .lean();
    }
    if (!template || template.status !== "Active") {
      return res
        .status(404)
        .json({ message: "Template not found or inactive" });
    }
    template.mainImageUrl =
      template.images?.find((img) => img.isMain)?.url ||
      template.images?.[0]?.url ||
      null;
    res.json({ success: true, template });
  } catch (error) {
    console.error("❌ Public template fetch failed:", error.message);
    res.status(500).json({ message: "Server error fetching template" });
  }
};


// Search Function
export const searchPublicTemplates = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ success: true, count: 0, templates: [] });
    }

    const query = q.trim();
    const perPage = Math.min(Number(limit) || 30, 100);

    // 🌟 SAFE REGEX (case-insensitive)
    const regex = new RegExp(query, "i");

    // 🌟 Search across multiple fields
    const results = await Template.find(
      {
        status: "Active",
        $or: [
          { title: regex },
          { description: regex },
          { metaKeywords: regex },
          { style_tags: regex },
          { color_tags: regex },
          { productType: regex }
        ]
      }
    )
      .limit(perPage)
      .populate("categories", "name slug")
      .lean();

    const formatted = results.map((tpl) => ({
      ...tpl,
      mainImageUrl:
        tpl.images?.find((img) => img.isMain)?.url ||
        tpl.images?.[0]?.url ||
        null,
    }));

    res.json({
      success: true,
      count: formatted.length,
      templates: formatted,
    });

  } catch (error) {
    console.error("❌ Regex search failed:", error.message);
    res.status(500).json({ message: "Server error during search" });
  }
};


// small helper to safely build regex from user input
function escapeRegExp(string = "") {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
