import Category from '../models/Category.js';
import Plant from '../models/Plant.js';
import Section from '../models/Section.js';
import slugify from 'slugify';
import mongoose from 'mongoose';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('section', 'name slug')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get categories by section
// @route   GET /api/categories/section/:sectionId
// @access  Public
export const getCategoriesBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    let query = {};
    
    if (mongoose.Types.ObjectId.isValid(sectionId)) {
      query.section = sectionId;
    } else {
      const section = await Section.findOne({ slug: sectionId });
      if (section) {
        query.section = section._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    }
    
    const categories = await Category.find(query)
      .populate('section', 'name slug')
      .sort({ name: 1 });
    
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('section', 'name slug');
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    const plants = await Plant.find({ category: category._id })
      .populate('section', 'name slug')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: { category, plants }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('section', 'name slug');
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    const plants = await Plant.find({ category: category._id })
      .populate('section', 'name slug')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: { category, plants }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, section, image, description } = req.body;
    
    const sectionExists = await Section.findById(section);
    if (!sectionExists) {
      return res.status(400).json({ success: false, message: 'Section not found' });
    }
    
    const slug = slugify(name, { lower: true, strict: true });
    
    const category = await Category.create({
      name,
      slug,
      image: image || '',
      description: description || '',
      section
    });
    
    await category.populate('section', 'name slug');
    
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category already exists in this section' 
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
    
    if (section) {
      const sectionExists = await Section.findById(section);
      if (!sectionExists) {
        return res.status(400).json({ success: false, message: 'Section not found' });
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
    if (section) updateData.section = section;
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('section', 'name slug');
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category already exists in this section' 
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
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    const plantCount = await Plant.countDocuments({ category: category._id });
    
    if (plantCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category with existing plants. Please delete plants first.' 
      });
    }
    
    await category.deleteOne();
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};