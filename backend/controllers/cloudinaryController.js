import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Delete image from Cloudinary
// @route   POST /api/cloudinary/delete
// @access  Private/Admin
export const deleteImage = async (req, res) => {
  console.log("=".repeat(60));
  console.log("🗑️ DELETE IMAGE REQUEST");
  console.log("=".repeat(60));
  console.log("Request body:", req.body);
  console.log("User:", req.user?._id, req.user?.email);

  try {
    const { publicId } = req.body;

    if (!publicId) {
      console.log("❌ No public ID provided");
      return res.status(400).json({
        success: false,
        message: "Public ID is required",
      });
    }

    console.log("📦 Public ID:", publicId);
    console.log("☁️ Cloudinary config:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      has_api_key: !!process.env.CLOUDINARY_API_KEY,
      has_api_secret: !!process.env.CLOUDINARY_API_SECRET,
    });

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("✅ Cloudinary result:", result);

    if (result.result === "ok") {
      console.log("✅ Image deleted successfully");
      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      console.log("❌ Failed to delete image:", result);
      res.status(400).json({
        success: false,
        message: "Failed to delete image",
        result,
      });
    }
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete image",
    });
  }
};

// @desc    Upload image to Cloudinary (optional - if you want to handle uploads via backend)
// @route   POST /api/cloudinary/upload
// @access  Private/Admin
export const uploadImage = async (req, res) => {
  console.log("=".repeat(60));
  console.log("📤 UPLOAD IMAGE REQUEST");
  console.log("=".repeat(60));

  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const imageFile = req.files.image;
    console.log("File:", {
      name: imageFile.name,
      size: imageFile.size,
      mimetype: imageFile.mimetype,
    });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.tempFilePath, {
      folder: "homegarden",
      public_id: `plant_${Date.now()}`,
    });

    console.log("✅ Upload successful:", result.public_id);

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get Cloudinary signature for direct upload (optional)
// @route   GET /api/cloudinary/signature
// @access  Private/Admin
export const getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "homegarden";

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET,
    );

    res.json({
      success: true,
      data: {
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        folder,
      },
    });
  } catch (error) {
    console.error("❌ Signature error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
