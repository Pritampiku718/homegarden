import mongoose from "mongoose";

const varietySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Variety name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    image: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
    },
  },
  { timestamps: true },
);

// Ensure unique variety name within the same category
varietySchema.index({ name: 1, category: 1 }, { unique: true });
varietySchema.index({ slug: 1, category: 1 }, { unique: true });

// Generate slug before saving - FIXED VERSION with error handling
varietySchema.pre("save", function (next) {
  try {
    if (this.isModified("name")) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
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

// Also add middleware for updates
varietySchema.pre("findOneAndUpdate", function (next) {
  try {
    const update = this.getUpdate();
    if (update.name) {
      update.slug = update.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
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

export default mongoose.model("Variety", varietySchema);
