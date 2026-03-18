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
    variety: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variety",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Define indexes
plantSchema.index({ section: 1, category: 1, variety: 1 });
plantSchema.index({ slug: 1 }, { unique: true });

// Validate that at least 1 and at most 3 images
plantSchema.path("images").validate(function (images) {
  return images && images.length >= 1 && images.length <= 3;
}, "Plants must have between 1 and 3 images");

// Set first image as main if none is marked - FIXED VERSION
plantSchema.pre("save", function (next) {
  try {
    if (this.images && this.images.length > 0) {
      const hasMain = this.images.some((img) => img.isMain === true);
      if (!hasMain) {
        this.images[0].isMain = true;
      }
    }
    // Make sure next is a function before calling
    if (typeof next === "function") {
      return next();
    }
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
  }
});

// Handle updates - FIXED VERSION
plantSchema.pre("findOneAndUpdate", function (next) {
  try {
    const update = this.getUpdate();
    if (update.images && update.images.length > 0) {
      const hasMain = update.images.some((img) => img.isMain === true);
      if (!hasMain) {
        update.images[0].isMain = true;
      }
    }
    if (typeof next === "function") {
      return next();
    }
  } catch (error) {
    if (typeof next === "function") {
      return next(error);
    }
  }
});

export default mongoose.model("Plant", plantSchema);
