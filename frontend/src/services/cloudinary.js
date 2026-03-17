const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = "homegarden_upload";

// Upload image to Cloudinary
export const uploadImage = async (file) => {
  if (!file) return null;

  console.log("🚀 Uploading to Cloudinary...", {
    cloudName: CLOUD_NAME,
    preset: UPLOAD_PRESET,
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("cloud_name", CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cloudinary error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }

    if (data.secure_url) {
      console.log("✅ Upload successful:", {
        url: data.secure_url,
        publicId: data.public_id,
        format: data.format,
        size: `${(data.bytes / 1024).toFixed(2)} KB`,
      });

      // Return both URL and public ID for deletion capability
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } else {
      throw new Error("Upload failed - no URL returned");
    }
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    throw error;
  }
};

// Delete image from Cloudinary (requires backend endpoint)
export const deleteImage = async (publicId) => {
  if (!publicId) {
    console.warn("⚠️ No public ID provided for deletion");
    return false;
  }

  console.log("🗑️ Deleting from Cloudinary...", { publicId });

  try {
    // Using backend endpoint that has the API secret
    const response = await fetch("/api/cloudinary/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cloudinary delete error:", data);
      throw new Error(data.error?.message || "Delete failed");
    }

    console.log("✅ Delete successful:", data.message);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    // Cloudinary URL format examples:
    // https://res.cloudinary.com/cloudname/image/upload/v1234567/public_id.extension
    // https://res.cloudinary.com/cloudname/image/upload/public_id.extension

    // Match patterns:
    // 1. With version: /upload/v1234567/public_id.extension
    // 2. Without version: /upload/public_id.extension
    const patterns = [
      /\/upload\/(?:v\d+\/)?(.+?)\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)$/i,
      /\/upload\/(?:v\d+\/)?(.+?)$/i, // Fallback for URLs without extension
    ];

    for (const pattern of patterns) {
      const matches = url.match(pattern);
      if (matches) {
        const publicId = matches[1];
        console.log("🔍 Extracted public ID:", publicId);
        return publicId;
      }
    }

    console.warn("⚠️ Could not extract public ID from URL:", url);
    return null;
  } catch (error) {
    console.error("❌ Error extracting public ID:", error);
    return null;
  }
};

// Alternative: Delete image using Cloudinary's unsigned method (if you enable it)
// This is less secure but can be used if you don't have a backend
export const deleteImageUnsigned = async (publicId) => {
  if (!publicId) return false;

  console.log("🗑️ Deleting from Cloudinary (unsigned)...", { publicId });

  // Note: This requires you to enable unsigned deletions in your Cloudinary settings
  // Go to Settings > Security > Allow unsigned deletions
  try {
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (data.result === "ok") {
      console.log("✅ Unsigned delete successful");
      return true;
    } else {
      console.error("❌ Unsigned delete failed:", data);
      return false;
    }
  } catch (error) {
    console.error("❌ Unsigned delete error:", error);
    return false;
  }
};

// Validate if URL is from Cloudinary
export const isCloudinaryUrl = (url) => {
  if (!url) return false;
  return url.includes("cloudinary.com") && url.includes("/upload/");
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !isCloudinaryUrl(url)) return url;

  const {
    width,
    height,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  // Split the URL to insert transformations
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  let transformations = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);

  const transformationString = transformations.join(",");

  return `${parts[0]}/upload/${transformationString}/${parts[1]}`;
};

// Upload multiple images
export const uploadMultipleImages = async (files) => {
  if (!files || files.length === 0) return [];

  console.log(`📤 Uploading ${files.length} images...`);

  const uploadPromises = files.map((file) => uploadImage(file));
  const results = await Promise.allSettled(uploadPromises);

  const successful = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);

  const failed = results.filter(
    (result) => result.status === "rejected",
  ).length;

  console.log(`✅ Successfully uploaded: ${successful.length}`);
  if (failed > 0) console.warn(`⚠️ Failed uploads: ${failed}`);

  return successful;
};
