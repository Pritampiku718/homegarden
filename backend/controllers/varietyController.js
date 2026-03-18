import Variety from "../models/Variety.js";
import Category from "../models/Category.js";
import Section from "../models/Section.js";
import Plant from "../models/Plant.js";
import slugify from "slugify";
import mongoose from "mongoose";

// @desc    Get all varieties
// @route   GET /api/varieties
// @access  Public
export const getVarieties = async (req, res) => {
  try {
    const varieties = await Variety.find()
      .populate("section", "name slug")
      .populate("category", "name slug")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: varieties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get varieties by category
// @route   GET /api/varieties/category/:categoryId
// @access  Public
export const getVarietiesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    let query = {};

    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      query.category = categoryId;
    } else {
      const category = await Category.findOne({ slug: categoryId });
      if (category) {
        query.category = category._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }

    const varieties = await Variety.find(query)
      .populate("section", "name slug")
      .populate("category", "name slug")
      .sort({ name: 1 });

    res.json({ success: true, data: varieties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single variety by ID
// @route   GET /api/varieties/:id
// @access  Public
export const getVarietyById = async (req, res) => {
  try {
    const variety = await Variety.findById(req.params.id)
      .populate("section", "name slug")
      .populate("category", "name slug");

    if (!variety) {
      return res
        .status(404)
        .json({ success: false, message: "Variety not found" });
    }

    const plants = await Plant.find({ subCategory: variety._id })
      .populate("section", "name slug")
      .populate("category", "name slug")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        variety,
        plants,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get variety by slug
// @route   GET /api/varieties/slug/:slug
// @access  Public
export const getVarietyBySlug = async (req, res) => {
  try {
    const variety = await Variety.findOne({ slug: req.params.slug })
      .populate("section", "name slug")
      .populate("category", "name slug");

    if (!variety) {
      return res
        .status(404)
        .json({ success: false, message: "Variety not found" });
    }

    const plants = await Plant.find({ subCategory: variety._id })
      .populate("section", "name slug")
      .populate("category", "name slug")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        variety,
        plants,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a variety
// @route   POST /api/varieties
// @access  Private/Admin
export const createVariety = async (req, res) => {
  try {
    const { name, category, section, image, description } = req.body;

    console.log("📦 Creating variety:", { name, category, section });

    // Verify category exists and belongs to section
    const categoryExists = await Category.findOne({
      _id: category,
      section: section,
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found in this section",
      });
    }

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

    // Check if variety with this slug already exists in the same category
    const existingVariety = await Variety.findOne({ slug, category });
    if (existingVariety) {
      return res.status(400).json({
        success: false,
        message: "A variety with this name already exists in this category",
      });
    }

    const variety = await Variety.create({
      name,
      slug,
      image: image || "",
      description: description || "",
      category,
      section,
    });

    await variety.populate(["section", "category"]);

    console.log("✅ Variety created:", variety._id);

    res.status(201).json({ success: true, data: variety });
  } catch (error) {
    console.error("❌ Create variety error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Variety already exists in this category",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update variety
// @route   PUT /api/varieties/:id
// @access  Private/Admin
export const updateVariety = async (req, res) => {
  try {
    const { name, category, section, image, description } = req.body;

    // Find the variety first
    const variety = await Variety.findById(req.params.id);
    if (!variety) {
      return res
        .status(404)
        .json({ success: false, message: "Variety not found" });
    }

    // Verify category and section relationship if both are provided
    if (category && section) {
      const categoryExists = await Category.findOne({
        _id: category,
        section: section,
      });
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found in this section",
        });
      }
    }

    // Generate new slug if name is being updated
    let slug;
    if (name && name !== variety.name) {
      slug = slugify(name, { lower: true, strict: true });

      // Check if new slug conflicts with another variety in the same category
      const targetCategory = category || variety.category;
      const existingVariety = await Variety.findOne({
        slug,
        category: targetCategory,
        _id: { $ne: req.params.id },
      });

      if (existingVariety) {
        return res.status(400).json({
          success: false,
          message: "A variety with this name already exists in this category",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (section) updateData.section = section;

    const updatedVariety = await Variety.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    ).populate(["section", "category"]);

    console.log("✅ Variety updated:", updatedVariety._id);

    res.json({ success: true, data: updatedVariety });
  } catch (error) {
    console.error("❌ Update variety error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Variety already exists in this category",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete variety
// @route   DELETE /api/varieties/:id
// @access  Private/Admin
export const deleteVariety = async (req, res) => {
  try {
    const variety = await Variety.findById(req.params.id);

    if (!variety) {
      return res
        .status(404)
        .json({ success: false, message: "Variety not found" });
    }

    // Check if any plants are using this variety
    const plantCount = await Plant.countDocuments({
      subCategory: variety._id,
    });

    if (plantCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete variety with existing plants. Please delete or reassign plants first.",
      });
    }

    await variety.deleteOne();

    console.log("✅ Variety deleted:", variety._id);

    res.json({ success: true, message: "Variety deleted successfully" });
  } catch (error) {
    console.error("❌ Delete variety error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
