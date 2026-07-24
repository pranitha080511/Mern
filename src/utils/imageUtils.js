const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Standardizes image URLs across all frontend components.
 * Handles absolute URLs (http://, https://, data:), relative paths (uploads/..., images/...),
 * leading slashes, and null/undefined values.
 */
export const formatImageUrl = (img) => {
  if (!img || typeof img !== 'string') {
    return 'https://placehold.co/400x400?text=No+Image';
  }

  // If already absolute URL or data URI
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
    return img;
  }

  // Strip leading slash if present
  const cleanPath = img.startsWith('/') ? img.slice(1) : img;

  return `${BASE_URL}/${cleanPath}`;
};

export default formatImageUrl;
