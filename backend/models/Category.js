import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: [true, 'Section is required']
  }
}, {
  timestamps: true
});

// A category name must be unique within a section
categorySchema.index({ name: 1, section: 1 }, { unique: true });
categorySchema.index({ slug: 1 });

export default mongoose.model('Category', categorySchema);