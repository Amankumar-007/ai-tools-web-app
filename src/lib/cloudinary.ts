// No need to import cloudinary server SDK, we'll use the API directly
export const uploadToCloudinary = async (base64Image: string): Promise<string> => {
  try {
    // Check if Cloudinary configuration is available
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.');
    }

    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    // Try different upload presets in order of preference
    const uploadPresets = [
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      'unsigned', // Common unsigned preset
      'ml_default' // Machine learning default
    ].filter(Boolean) as string[];
    
    let lastError: Error | null = null;
    
    for (const preset of uploadPresets) {
      try {
        const formDataWithPreset = new FormData();
        formDataWithPreset.append('file', `data:image/jpeg;base64,${base64Data}`);
        formDataWithPreset.append('upload_preset', preset);
        formDataWithPreset.append('resource_type', 'image');
        
        // Upload directly to Cloudinary API
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formDataWithPreset,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Cloudinary error with preset '${preset}':`, errorData);
          lastError = new Error(`Cloudinary image upload failed with preset '${preset}': ${errorData.error?.message || 'Unknown error'}`);
          continue; // Try next preset
        }

        const data = await response.json();
        if (!data.secure_url) {
          lastError = new Error('No secure URL returned from Cloudinary');
          continue; // Try next preset
        }
        
        return data.secure_url;
      } catch (presetError) {
        console.error(`Failed with preset '${preset}':`, presetError);
        lastError = presetError instanceof Error ? presetError : new Error('Unknown error');
        continue; // Try next preset
      }
    }
    
    // If all presets failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error('All upload presets failed');
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error
    }
    throw new Error('Failed to upload image');
  }
};

// Upload PDF to Cloudinary
export const uploadPDFToCloudinary = async (base64PDF: string): Promise<string> => {
  try {
    // Check if Cloudinary configuration is available
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your environment variables.');
    }

    // Remove data:application/pdf;base64, prefix if present
    const base64Data = base64PDF.includes('base64,') 
      ? base64PDF.split('base64,')[1] 
      : base64PDF;

    // Create form data for Cloudinary upload
    const formData = new FormData();
    formData.append('file', `data:application/pdf;base64,${base64Data}`);
    
    // Try different upload presets in order of preference
    const uploadPresets = [
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      'unsigned', // Common unsigned preset
      'ml_default' // Machine learning default
    ].filter(Boolean) as string[];
    
    let lastError: Error | null = null;
    
    for (const preset of uploadPresets) {
      try {
        const formDataWithPreset = new FormData();
        formDataWithPreset.append('file', `data:application/pdf;base64,${base64Data}`);
        formDataWithPreset.append('upload_preset', preset);
        formDataWithPreset.append('resource_type', 'raw');
        
        // Upload directly to Cloudinary API for PDFs
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
          {
            method: 'POST',
            body: formDataWithPreset,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Cloudinary error with preset '${preset}':`, errorData);
          lastError = new Error(`Cloudinary PDF upload failed with preset '${preset}': ${errorData.error?.message || 'Unknown error'}`);
          continue; // Try next preset
        }

        const data = await response.json();
        if (!data.secure_url) {
          lastError = new Error('No secure URL returned from Cloudinary');
          continue; // Try next preset
        }
        
        return data.secure_url;
      } catch (presetError) {
        console.error(`Failed with preset '${preset}':`, presetError);
        lastError = presetError instanceof Error ? presetError : new Error('Unknown error');
        continue; // Try next preset
      }
    }
    
    // If all presets failed, throw the last error
    if (lastError) {
      throw lastError;
    }
    
    throw new Error('All upload presets failed');
  } catch (error) {
    console.error('PDF upload error:', error);
    if (error instanceof Error) {
      throw error; // Re-throw the specific error
    }
    throw new Error('Failed to upload PDF');
  }
};

// Generic upload function that handles both images and PDFs
export const uploadFileToCloudinary = async (base64File: string, fileType: 'image' | 'pdf'): Promise<string> => {
  if (fileType === 'pdf') {
    return uploadPDFToCloudinary(base64File);
  } else {
    return uploadToCloudinary(base64File);
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