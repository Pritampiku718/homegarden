import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plant name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    images: [
      {
        url: {
          type: String,
          required: [true, "Image URL is required"],
        },
        publicId: {
          type: String,
        },
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    inStock: {
      type: Boolean,
      default: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    variety: {  // Changed from subCategory to variety
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variety",  // Updated reference
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Define indexes
plantSchema.index({ section: 1, category: 1, variety: 1 }); // Updated index
plantSchema.index({ slug: 1 }, { unique: true });

// Validate that at least 1 and at most 3 images
plantSchema.path("images").validate(function (images) {
  return images && images.length >= 1 && images.length <= 3;
}, "Plants must have between 1 and 3 images");

// Set first image as main if none is marked
plantSchema.pre("save", function (next) {
  if (this.images && this.images.length > 0) {
    const hasMain = this.images.some((img) => img.isMain === true);
    if (!hasMain) {
      this.images[0].isMain = true;
    }
  }
  next();
});

// Handle updates
plantSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.images && update.images.length > 0) {
    const hasMain = update.images.some((img) => img.isMain === true);
    if (!hasMain) {
      update.images[0].isMain = true;
    }
  }
  next();
});

export default mongoose.model("Plant", plantSchema);