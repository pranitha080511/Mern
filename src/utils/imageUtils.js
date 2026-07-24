const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://mern-oknu.onrender.com';
  }
  return 'http://localhost:5000';
};

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
  const rawUrl = getBaseUrl();
  const cleanBase = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

  return `${cleanBase}/${cleanPath}`;
};

export default formatImageUrl;
