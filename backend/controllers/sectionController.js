import Section from '../models/Section.js';
import Category from '../models/Category.js';
import Plant from '../models/Plant.js';
import slugify from 'slugify';

// @desc    Get all sections
// @route   GET /api/sections
// @access  Public
export const getSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ name: 1 });
    res.json({
      success: true,
      data: sections
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single section by ID
// @route   GET /api/sections/:id
// @access  Public
export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get section by slug
// @route   GET /api/sections/slug/:slug
// @access  Public
export const getSectionBySlug = async (req, res) => {
  try {
    const section = await Section.findOne({ slug: req.params.slug });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }

    // Get categories in this section
    const categories = await Category.find({ section: section._id })
      .sort({ name: 1 });

    // Get plants count per category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const plantCount = await Plant.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          plantCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        section,
        categories: categoriesWithCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a section
// @route   POST /api/sections
// @access  Private/Admin
export const createSection = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    
    // Generate slug
    const slug = slugify(name, { lower: true, strict: true });
    
    const section = await Section.create({
      name,
      slug,
      image: image || '',
      description: description || ''
    });
    
    res.status(201).json({
      success: true,
      data: section
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Section name must be unique'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private/Admin
export const updateSection = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    
    // Generate new slug if name changed
    let slug;
    if (name) {
      slug = slugify(name, { lower: true, strict: true });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Section name must be unique'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private/Admin
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    // Check if section has categories
    const categoryCount = await Category.countDocuments({ section: section._id });
    
    if (categoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete section with existing categories. Please delete categories first.'
      });
    }
    
    await section.deleteOne();
    
    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};