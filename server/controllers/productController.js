import Product from '../models/Product.js';

const defaultProducts = [
  { id: 1, name: 'Matte Lipstick', price: 799, image: 'images/lipstick.jpg', category: 'Makeup' },
  { id: 2, name: 'Vitamin C Serum', price: 999, image: 'images/serum.jpg', category: 'Skincare' },
  { id: 3, name: 'Face Cream', price: 699, image: 'images/moisturizer.jpg', category: 'Skincare' },
  { id: 4, name: 'Luxury Perfume', price: 1999, image: 'images/perfume.jpg', category: 'Fragrance' },
  { id: 5, name: 'Nail Polish', price: 499, image: 'images/nail.jpg', category: 'Nail Care' },
  { id: 6, name: 'Foundation', price: 1099, image: 'images/foundation.jpg', category: 'Makeup' },
  { id: 7, name: 'Waterproof Eyeliner', price: 399, image: 'images/eyeliner.jpg', category: 'Makeup' },
  { id: 8, name: 'Face Wash', price: 599, image: 'images/facewash.jpg', category: 'Skincare' },
  { id: 9, name: 'Sunscreen SPF 50', price: 899, image: 'images/sunscreen.jpg', category: 'Skincare' },
  { id: 10, name: 'Blush Palette', price: 749, image: 'images/blush.jpg', category: 'Makeup' },
  { id: 11, name: 'Compact Powder', price: 699, image: 'images/compact.jpg', category: 'Makeup' },
  { id: 12, name: 'Face Cleanser', price: 649, image: 'images/cleanser.jpg', category: 'Skincare' }
];

// @desc    Get all products (auto-seeding if empty)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    let products = await Product.find({});
    
    // Auto-seed if empty
    if (products.length === 0) {
      console.log('No products found in DB. Auto-seeding default items...');
      await Product.insertMany(defaultProducts);
      products = await Product.find({});
    }
    
    return res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Manually seed products
// @route   POST /api/products/seed
// @access  Public
export const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({}); // Reset collection
    const createdProducts = await Product.insertMany(defaultProducts);
    return res.status(201).json({ message: 'Products seeded successfully', count: createdProducts.length });
  } catch (error) {
    console.error('Seed products error:', error);
    return res.status(500).json({ message: error.message });
  }
};
