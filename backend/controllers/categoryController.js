import Category from "../models/Category.js";
import Plant from "../models/Plant.js";
import Section from "../models/Section.js";
import Variety from "../models/Variety.js"; // Added Variety import
import slugify from "slugify";
import mongoose from "mongoose";

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const categories = await Category.find()
      .populate("section", "name slug")
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Category.countDocuments();

    res.json({
      success: true,
      count: categories.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: categories,
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get categories by section
// @route   GET /api/categories/section/:sectionId
// @access  Public
export const getCategoriesBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    let query = {};

    if (mongoose.Types.ObjectId.isValid(sectionId)) {
      query.section = sectionId;
    } else {
      const section = await Section.findOne({ slug: sectionId });
      if (section) {
        query.section = section._id;
      } else {
        return res.json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          pages: 0,
          data: [],
        });
      }
    }

    const categories = await Category.find(query)
      .populate("section", "name slug")
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Category.countDocuments(query);

    res.json({
      success: true,
      count: categories.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: categories,
    });
  } catch (error) {
    console.error("Error in getCategoriesBySection:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "section",
      "name slug",
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Get varieties in this category
    const varieties = await Variety.find({ category: category._id }).sort({
      name: 1,
    });

    // Get plants in this category
    const plants = await Plant.find({ category: category._id })
      .populate("variety", "name slug") // Updated to variety
      .populate("section", "name slug")
      .sort({ name: 1 })
      .limit(20);

    // Get plant count
    const plantCount = await Plant.countDocuments({ category: category._id });

    res.json({
      success: true,
      data: {
        category,
        varieties, // Added varieties
        plants,
        stats: {
          plantCount,
          varietyCount: varieties.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug }).populate(
      "section",
      "name slug",
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Get varieties in this category
    const varieties = await Variety.find({ category: category._id }).sort({
      name: 1,
    });

    // Get plants in this category
    const plants = await Plant.find({ category: category._id })
      .populate("variety", "name slug") // Updated to variety
      .populate("section", "name slug")
      .sort({ name: 1 })
      .limit(20);

    // Get plant count
    const plantCount = await Plant.countDocuments({ category: category._id });

    res.json({
      success: true,
      data: {
        category,
        varieties, // Added varieties
        plants,
        stats: {
          plantCount,
          varietyCount: varieties.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in getCategoryBySlug:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category with its varieties (ENHANCEMENT)
// @route   GET /api/categories/:id/with-varieties
// @access  Public
export const getCategoryWithVarieties = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "section",
      "name slug",
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Get all varieties in this category
    const varieties = await Variety.find({ category: category._id }).sort({
      name: 1,
    });

    // For each variety, get plant count
    const varietiesWithStats = await Promise.all(
      varieties.map(async (variety) => {
        const plantCount = await Plant.countDocuments({ variety: variety._id });
        return {
          ...variety.toObject(),
          plantCount,
        };
      }),
    );

    // Get recent plants (limit 10)
    const recentPlants = await Plant.find({ category: category._id })
      .populate("variety", "name slug")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get total stats
    const totalPlants = await Plant.countDocuments({ category: category._id });

    res.json({
      success: true,
      data: {
        category,
        varieties: varietiesWithStats,
        recentPlants,
        stats: {
          totalPlants,
          totalVarieties: varieties.length,
        },
      },
    });
  } catch (error) {
    console.error("Error in getCategoryWithVarieties:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, section, image, description } = req.body;

    console.log("📦 Creating category:", { name, section });

    // Verify section exists
    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(400).json({
        success: false,
        message: "Section not found",
      });
    }

    // Generate slug
    const slug = slugify(name, { lower: true, strict: true });

    // Check if category with this slug already exists in the section
    const existingCategory = await Category.findOne({ slug, section });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists in this section",
      });
    }

    const category = await Category.create({
      name,
      slug,
      image: image || "",
      description: description || "",
      section,
    });

    await category.populate("section", "name slug");

    console.log("✅ Category created:", category._id);

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("❌ Create category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category already exists in this section",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        })),
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { name, section, image, description } = req.body;

    console.log("📦 Updating category:", req.params.id, req.body);

    // Find existing category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Verify section exists if provided
    if (section) {
      const sectionExists = await Section.findById(section);
      if (!sectionExists) {
        return res.status(400).json({
          success: false,
          message: "Section not found",
        });
      }
    }

    // Generate new slug if name changed
    let slug;
    if (name && name !== category.name) {
      slug = slugify(name, { lower: true, strict: true });

      // Check if new slug conflicts with another category in the same section
      const targetSection = section || category.section;
      const existingCategory = await Category.findOne({
        slug,
        section: targetSection,
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category already exists in this section",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (section) updateData.section = section;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).populate("section", "name slug");

    console.log("✅ Category updated:", updatedCategory._id);

    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error("❌ Update category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category already exists in this section",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        })),
      });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if category has plants
    const plantCount = await Plant.countDocuments({ category: category._id });

    if (plantCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with existing plants. Please delete plants first.",
      });
    }

    // Check if category has varieties
    const varietyCount = await Variety.countDocuments({
      category: category._id,
    });

    if (varietyCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete category with existing varieties. Please delete varieties first.",
      });
    }

    await category.deleteOne();

    console.log("✅ Category deleted:", category._id);

    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ Delete category error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
