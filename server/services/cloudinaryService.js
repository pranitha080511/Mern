import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const uploadToCloudinary = async (filePath) => {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'hikari-products',
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured || !publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { invalidate: true });
};

const cleanupLocalFile = (filePath) => {
  if (!filePath) return;

  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      console.warn(`Unable to delete temporary upload file: ${filePath}`, unlinkErr.message);
    }
  });
};

export {
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
  cleanupLocalFile,
};
