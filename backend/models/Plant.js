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
      // REMOVE index: true from here - we'll use schema.index() instead
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
    // Updated to images array
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
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Define indexes here - ONCE
plantSchema.index({ section: 1, category: 1, subCategory: 1 });
plantSchema.index({ slug: 1 }, { unique: true }); // Keep this one, remove from field

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

// Also handle updates
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
