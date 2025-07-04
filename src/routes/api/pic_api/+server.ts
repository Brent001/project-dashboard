import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

// Configuration
const CLOUDINARY_CONFIG = {
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
  api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET
} as const;

const UPLOAD_CONSTRAINTS = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  folder: 'profile_pics',
  transformations: [
    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
} as const;

// Initialize Cloudinary
cloudinary.config(CLOUDINARY_CONFIG);

// Utility functions
const validateEnvironmentVariables = (): void => {
  const { cloud_name, api_key, api_secret } = CLOUDINARY_CONFIG;
  
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Missing required Cloudinary environment variables');
  }
};

const validateFile = (file: unknown): file is File => {
  if (!file || typeof file === 'string') {
    throw new Error('No file uploaded');
  }
  
  const fileObj = file as File;
  
  if (!UPLOAD_CONSTRAINTS.allowedTypes.includes(fileObj.type as any)) {
    throw new Error('Invalid file type. Supported formats: JPEG, PNG, WebP, GIF');
  }
  
  if (fileObj.size > UPLOAD_CONSTRAINTS.maxFileSize) {
    throw new Error(`File too large. Maximum size: ${UPLOAD_CONSTRAINTS.maxFileSize / (1024 * 1024)}MB`);
  }
  
  return true;
};

const uploadToCloudinary = async (buffer: Buffer, username: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_CONSTRAINTS.folder,
        public_id: `${UPLOAD_CONSTRAINTS.folder}/${username}`, // Use full path as public_id
        overwrite: true,
        transformation: UPLOAD_CONSTRAINTS.transformations
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else if (!result) {
          reject(new Error('Upload failed: No result returned'));
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

const generateImageUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

// Require authentication for this endpoint
function requireAuth(cookies: import('@sveltejs/kit').Cookies) {
  const session = cookies.get('session');
  if (!session) {
    throw json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

// Request handlers
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    requireAuth(cookies);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;

    if (!file || !username) {
      console.error('Missing file or username');
      return json({ success: false, error: 'Missing file or username' }, { status: 400 });
    }

    validateEnvironmentVariables();
    
    if (!username || username.trim() === '') {
      return json({
        success: false,
        error: 'Username is required'
      }, { status: 400 });
    }
    
    validateFile(file);
    
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const uploadResult = await uploadToCloudinary(buffer, username);
    
    return json({
      success: true,
      data: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      }
    });
    
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return json({ 
      success: false, 
      error: 'Cloudinary upload failed: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ url, cookies }) => {
  try {
    requireAuth(cookies);

    validateEnvironmentVariables();
    
    const publicId = url.searchParams.get('public_id');
    
    if (!publicId || publicId.trim() === '') {
      return json({
        success: false,
        error: 'public_id parameter is required'
      }, { status: 400 });
    }
    
    const imageUrl = generateImageUrl(publicId);
    
    return json({
      success: true,
      data: {
        url: imageUrl,
        public_id: publicId
      }
    });
    
  } catch (error) {
    console.error('URL generation error:', error);
    
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image URL'
    }, { status: 500 });
  }
};