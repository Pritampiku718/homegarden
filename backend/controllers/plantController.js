import Plant from "../models/Plant.js";
import Category from "../models/Category.js";
import Section from "../models/Section.js";
import SubCategory from "../models/SubCategory.js";
import slugify from "slugify";
import mongoose from "mongoose";

// @desc    Get all plants with optional filtering
// @route   GET /api/plants
// @access  Public
export const getPlants = async (req, res) => {
  try {
    const { category, section, subCategory, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    // Handle category filter
    if (category) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(category);

      if (isValidObjectId) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
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
    }

    // Handle section filter
    if (section) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(section);

      if (isValidObjectId) {
        query.section = section;
      } else {
        const sectionDoc = await Section.findOne({ slug: section });
        if (sectionDoc) {
          query.section = sectionDoc._id;
        }
      }
    }

    // Handle subCategory filter
    if (subCategory) {
      const isValidObjectId = mongoose.Types.ObjectId.isValid(subCategory);

      if (isValidObjectId) {
        query.subCategory = subCategory;
      } else {
        const subCategoryDoc = await SubCategory.findOne({ slug: subCategory });
        if (subCategoryDoc) {
          query.subCategory = subCategoryDoc._id;
        } else {
          // If subCategory slug doesn't exist, return empty array
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
    }

    const plants = await Plant.find(query)
      .populate("section", "name slug")
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Plant.countDocuments(query);

    res.json({
      success: true,
      count: plants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: plants,
    });
  } catch (error) {
    console.error("Error in getPlants:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get plant by ID
// @route   GET /api/plants/:id
// @access  Public
export const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate("section", "name slug")
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    res.json({
      success: true,
      data: plant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get plant by slug
// @route   GET /api/plants/slug/:slug
// @access  Public
export const getPlantBySlug = async (req, res) => {
  try {
    const plant = await Plant.findOne({ slug: req.params.slug })
      .populate("section", "name slug")
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    // Get related plants (same category or subCategory)
    const relatedPlants = await Plant.find({
      $or: [
        { category: plant.category._id },
        { subCategory: plant.subCategory?._id },
      ],
      _id: { $ne: plant._id },
    })
      .limit(4)
      .select("name slug price images section category subCategory")
      .populate("category", "name")
      .populate("subCategory", "name");

    res.json({
      success: true,
      data: {
        plant,
        relatedPlants,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get plants by section
// @route   GET /api/plants/section/:sectionId
// @access  Public
export const getPlantsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let sectionQuery = {};

    if (mongoose.Types.ObjectId.isValid(sectionId)) {
      sectionQuery._id = sectionId;
    } else {
      const section = await Section.findOne({ slug: sectionId });
      if (section) {
        sectionQuery._id = section._id;
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

    const plants = await Plant.find({ section: sectionQuery._id })
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Plant.countDocuments({ section: sectionQuery._id });

    res.json({
      success: true,
      count: plants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: plants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get plants by category
// @route   GET /api/plants/category/:categoryId
// @access  Public
export const getPlantsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let categoryQuery = {};

    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      categoryQuery._id = categoryId;
    } else {
      const category = await Category.findOne({ slug: categoryId });
      if (category) {
        categoryQuery._id = category._id;
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

    const plants = await Plant.find({ category: categoryQuery._id })
      .populate("section", "name slug")
      .populate("subCategory", "name slug")
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Plant.countDocuments({ category: categoryQuery._id });

    res.json({
      success: true,
      count: plants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: plants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get plants by subCategory
// @route   GET /api/plants/subcategory/:subCategoryId
// @access  Public
export const getPlantsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    let subCategoryQuery = {};

    if (mongoose.Types.ObjectId.isValid(subCategoryId)) {
      subCategoryQuery._id = subCategoryId;
    } else {
      const subCategory = await SubCategory.findOne({ slug: subCategoryId });
      if (subCategory) {
        subCategoryQuery._id = subCategory._id;
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

    const plants = await Plant.find({ subCategory: subCategoryQuery._id })
      .populate("section", "name slug")
      .populate("category", "name slug")
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Plant.countDocuments({
      subCategory: subCategoryQuery._id,
    });

    res.json({
      success: true,
      count: plants.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: plants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a plant
// @route   POST /api/plants
// @access  Private/Admin
export const createPlant = async (req, res) => {
  try {
    const { name, price, description, images, section, category, subCategory } =
      req.body;

    console.log("📦 Creating plant with data:", {
      name,
      price,
      description,
      images,
      section,
      category,
      subCategory,
    });

    // Validate required fields
    if (!name || !price || !description || !section || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, price, description, section, category are required",
      });
    }

    // Validate images (1-3 images)
    if (
      !images ||
      !Array.isArray(images) ||
      images.length < 1 ||
      images.length > 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Please upload between 1 and 3 images",
      });
    }

    // Validate each image has URL
    for (const img of images) {
      if (!img.url) {
        return res.status(400).json({
          success: false,
          message: "Each image must have a URL",
        });
      }
    }

    // Verify section exists
    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(400).json({
        success: false,
        message: "Section not found",
      });
    }

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

    // Verify subCategory if provided
    if (subCategory) {
      const subCategoryExists = await SubCategory.findOne({
        _id: subCategory,
        category: category,
        section: section,
      });

      if (!subCategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Sub-category not found in this category",
        });
      }
    }

    // Generate slug
    let slug = slugify(name, { lower: true, strict: true });

    // Check if slug exists
    const existingPlant = await Plant.findOne({ slug });
    if (existingPlant) {
      slug = `${slug}-${Date.now()}`;
    }

    // Set first image as main if none is marked
    const processedImages = images.map((img, index) => ({
      url: img.url,
      publicId: img.publicId || "",
      isMain: img.isMain || index === 0,
    }));

    const plant = await Plant.create({
      name,
      slug,
      price,
      description,
      images: processedImages,
      section,
      category,
      subCategory: subCategory || null,
    });

    await plant.populate(["section", "category", "subCategory"]);

    console.log("✅ Plant created:", plant._id);

    res.status(201).json({
      success: true,
      data: plant,
    });
  } catch (error) {
    console.error("❌ Create plant error:", error);

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

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A plant with this name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update plant
// @route   PUT /api/plants/:id
// @access  Private/Admin
export const updatePlant = async (req, res) => {
  try {
    const { name, price, description, images, section, category, subCategory } =
      req.body;

    console.log("📦 Updating plant:", req.params.id, req.body);

    // Find existing plant
    const plant = await Plant.findById(req.params.id);
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    // Validate images if provided (1-3 images)
    if (images) {
      if (!Array.isArray(images) || images.length < 1 || images.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Please upload between 1 and 3 images",
        });
      }

      // Validate each image has URL
      for (const img of images) {
        if (!img.url) {
          return res.status(400).json({
            success: false,
            message: "Each image must have a URL",
          });
        }
      }
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

    // Verify category exists and belongs to section if both provided
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

    // Verify subCategory if provided
    if (subCategory) {
      const subCategoryExists = await SubCategory.findOne({
        _id: subCategory,
        ...(category && { category }),
        ...(section && { section }),
      });

      if (!subCategoryExists) {
        return res.status(400).json({
          success: false,
          message: "Sub-category not found",
        });
      }
    }

    // Generate new slug if name changed
    let slug;
    if (name && name !== plant.name) {
      slug = slugify(name, { lower: true, strict: true });

      // Check if new slug conflicts with another plant
      const existingPlant = await Plant.findOne({
        slug,
        _id: { $ne: req.params.id },
      });

      if (existingPlant) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (price) updateData.price = price;
    if (description) updateData.description = description;
    if (images) {
      // Set first image as main if none is marked
      updateData.images = images.map((img, index) => ({
        url: img.url,
        publicId: img.publicId || "",
        isMain: img.isMain || index === 0,
      }));
    }
    if (section) updateData.section = section;
    if (category) updateData.category = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory || null;

    const updatedPlant = await Plant.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate(["section", "category", "subCategory"]);

    console.log("✅ Plant updated:", updatedPlant._id);

    res.json({
      success: true,
      data: updatedPlant,
    });
  } catch (error) {
    console.error("❌ Update plant error:", error);

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

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete plant
// @route   DELETE /api/plants/:id
// @access  Private/Admin
export const deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: "Plant not found",
      });
    }

    await plant.deleteOne();

    res.json({
      success: true,
      message: "Plant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
