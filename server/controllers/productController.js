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

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    
    if (!name || !price || !image || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const id = Date.now(); // Generate numeric ID

    const product = new Product({
      id,
      name,
      price,
      image,
      category,
      inStock: true
    });

    const createdProduct = await product.save();

    // Send email to all users asynchronously
    try {
      const User = (await import('../models/User.js')).default;
      const { sendNewProductEmail } = await import('../services/emailService.js');
      const users = await User.find({}).select('email');
      const emails = users.map(u => u.email);
      if (emails.length > 0) {
        sendNewProductEmail(createdProduct, emails);
      }
    } catch (emailErr) {
      console.error('Error sending new product email:', emailErr);
    }

    return res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const { name, price, image, category, inStock } = req.body;
    
    const product = await Product.findOne({ id: Number(req.params.id) });

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.image = image || product.image;
      product.category = category || product.category;
      if (inStock !== undefined) {
        product.inStock = inStock;
      }

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });

    if (product) {
      await Product.deleteOne({ id: Number(req.params.id) });
      return res.json({ message: 'Product removed' });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: error.message });
  }
};
