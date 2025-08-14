// No need to import cloudinary server SDK, we'll use the API directly
export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    // Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64Data}`);
    formData.append('upload_preset', 'ml_default'); // Create this in your Cloudinary settings
    
    // Upload directly to Cloudinary API
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Helper function to transform Cloudinary URLs
export const getOptimizedImageUrl = (url: string, options?: {
  width?: number;
  height?: number;
  quality?: string | number;
}) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  
  const { width = 1024, height = 1024, quality = 'auto' } = options || {};
  
  // Insert transformations into Cloudinary URL
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},h_${height},c_limit,q_${quality},f_auto/${parts[1]}`;
  }
  
  return url;
};