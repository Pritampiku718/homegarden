import Plant from '../models/Plant.js';
import Category from '../models/Category.js';
import Section from '../models/Section.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

// @desc    Get all plants with optional filtering
// @route   GET /api/plants
// @access  Public
export const getPlants = async (req, res) => {
  try {
    const { category, section, page = 1, limit = 20 } = req.query;
    
    // Build query
    const query = {};
    
    // Handle category filter - it could be category ID or slug
    if (category) {
      // Check if category is a valid ObjectId
      const isValidObjectId = mongoose.Types.ObjectId.isValid(category);
      
      if (isValidObjectId) {
        // It's an ID
        query.category = category;
      } else {
        // It's a slug - find the category first
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // No category found with this slug, return empty array
          return res.json({
            success: true,
            count: 0,
            total: 0,
            page: parseInt(page),
            pages: 0,
            data: []
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
    
    const plants = await Plant.find(query)
      .populate('section', 'name slug')
      .populate('category', 'name slug')
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
      data: plants
    });
  } catch (error) {
    console.error('Error in getPlants:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get plant by ID
// @route   GET /api/plants/:id
// @access  Public
export const getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id)
      .populate('section', 'name slug')
      .populate('category', 'name slug');
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }
    
    res.json({
      success: true,
      data: plant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get plant by slug
// @route   GET /api/plants/slug/:slug
// @access  Public
export const getPlantBySlug = async (req, res) => {
  try {
    const plant = await Plant.findOne({ slug: req.params.slug })
      .populate('section', 'name slug')
      .populate('category', 'name slug');
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }
    
    // Get related plants (same category)
    const relatedPlants = await Plant.find({
      category: plant.category._id,
      _id: { $ne: plant._id }
    })
    .limit(4)
    .select('name slug price image');
    
    res.json({
      success: true,
      data: {
        plant,
        relatedPlants
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
    
    // Handle if sectionId is ID or slug
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
          data: []
        });
      }
    }
    
    const plants = await Plant.find({ section: sectionQuery._id })
      .populate('category', 'name slug')
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
      data: plants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
    
    // Handle if categoryId is ID or slug
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
          data: []
        });
      }
    }
    
    const plants = await Plant.find({ category: categoryQuery._id })
      .populate('section', 'name slug')
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
      data: plants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a plant
// @route   POST /api/plants
// @access  Private/Admin
export const createPlant = async (req, res) => {
  try {
    const { name, price, description, image, section, category } = req.body;
    
    // Verify section exists
    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(400).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Verify category exists and belongs to section
    const categoryExists = await Category.findOne({ 
      _id: category,
      section: section 
    });
    
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found in this section'
      });
    }
    
    // Generate slug
    let slug = slugify(name, { lower: true, strict: true });
    
    // Check if slug exists
    const existingPlant = await Plant.findOne({ slug });
    if (existingPlant) {
      slug = `${slug}-${Date.now()}`;
    }
    
    const plant = await Plant.create({
      name,
      slug,
      price,
      description,
      image,
      section,
      category
    });
    
    await plant.populate(['section', 'category']);
    
    res.status(201).json({
      success: true,
      data: plant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update plant
// @route   PUT /api/plants/:id
// @access  Private/Admin
export const updatePlant = async (req, res) => {
  try {
    const { name, price, description, image, section, category } = req.body;
    
    // Verify section exists if provided
    if (section) {
      const sectionExists = await Section.findById(section);
      if (!sectionExists) {
        return res.status(400).json({
          success: false,
          message: 'Section not found'
        });
      }
    }
    
    // Verify category exists and belongs to section if both provided
    if (category && section) {
      const categoryExists = await Category.findOne({ 
        _id: category,
        section: section 
      });
      
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Category not found in this section'
        });
      }
    }
    
    // Generate new slug if name changed
    let slug;
    if (name) {
      slug = slugify(name, { lower: true, strict: true });
      
      // Check if new slug conflicts with another plant
      const existingPlant = await Plant.findOne({ 
        slug,
        _id: { $ne: req.params.id }
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
    if (image) updateData.image = image;
    if (section) updateData.section = section;
    if (category) updateData.category = category;
    
    const plant = await Plant.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate(['section', 'category']);
    
    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }
    
    res.json({
      success: true,
      data: plant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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
        message: 'Plant not found'
      });
    }
    
    await plant.deleteOne();
    
    res.json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};