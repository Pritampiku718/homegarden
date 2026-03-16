import SubCategory from '../models/SubCategory.js';
import Category from '../models/Category.js';
import Section from '../models/Section.js';
import Plant from '../models/Plant.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

// @desc    Get all sub-categories
// @route   GET /api/subcategories
// @access  Public
export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate('section', 'name slug')
      .populate('category', 'name slug')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: subCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sub-categories by category
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
export const getSubCategoriesByCategory = async (req, res) => {
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
    
    const subCategories = await SubCategory.find(query)
      .populate('section', 'name slug')
      .populate('category', 'name slug')
      .sort({ name: 1 });
    
    res.json({ success: true, data: subCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single sub-category by ID
// @route   GET /api/subcategories/:id
// @access  Public
export const getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate('section', 'name slug')
      .populate('category', 'name slug');
    
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }
    
    const plants = await Plant.find({ subCategory: subCategory._id })
      .populate('section', 'name slug')
      .populate('category', 'name slug')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: {
        subCategory,
        plants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get sub-category by slug
// @route   GET /api/subcategories/slug/:slug
// @access  Public
export const getSubCategoryBySlug = async (req, res) => {
  try {
    const subCategory = await SubCategory.findOne({ slug: req.params.slug })
      .populate('section', 'name slug')
      .populate('category', 'name slug');
    
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }
    
    const plants = await Plant.find({ subCategory: subCategory._id })
      .populate('section', 'name slug')
      .populate('category', 'name slug')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: {
        subCategory,
        plants
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a sub-category
// @route   POST /api/subcategories
// @access  Private/Admin
export const createSubCategory = async (req, res) => {
  try {
    const { name, category, section, image, description } = req.body;
    
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
    
    // Verify section exists
    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(400).json({
        success: false,
        message: 'Section not found'
      });
    }
    
    const slug = slugify(name, { lower: true, strict: true });
    
    const subCategory = await SubCategory.create({
      name,
      slug,
      image: image || '',
      description: description || '',
      category,
      section
    });
    
    await subCategory.populate(['section', 'category']);
    
    res.status(201).json({ success: true, data: subCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sub-category already exists in this category'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update sub-category
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
export const updateSubCategory = async (req, res) => {
  try {
    const { name, category, section, image, description } = req.body;
    
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
    
    let slug;
    if (name) {
      slug = slugify(name, { lower: true, strict: true });
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (section) updateData.section = section;
    
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate(['section', 'category']);
    
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }
    
    res.json({ success: true, data: subCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Sub-category already exists in this category'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete sub-category
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);
    
    if (!subCategory) {
      return res.status(404).json({ success: false, message: 'Sub-category not found' });
    }
    
    const plantCount = await Plant.countDocuments({ subCategory: subCategory._id });
    
    if (plantCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete sub-category with existing plants. Please delete plants first.'
      });
    }
    
    await subCategory.deleteOne();
    
    res.json({ success: true, message: 'Sub-category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};