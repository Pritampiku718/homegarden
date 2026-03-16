const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = 'homegarden_upload'; // Changed from 'homegarden_unsigned'

export const uploadImage = async (file) => {
  if (!file) return null;

  console.log('🚀 Uploading to Cloudinary...', {
    cloudName: CLOUD_NAME,
    preset: UPLOAD_PRESET,
    fileName: file.name
  });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('cloud_name', CLOUD_NAME);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cloudinary error:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    if (data.secure_url) {
      console.log('✅ Upload successful:', data.secure_url);
      return data.secure_url;
    } else {
      throw new Error('Upload failed - no URL returned');
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};