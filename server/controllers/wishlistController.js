import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user.wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add/remove product in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    // Find the product in MongoDB (supports numeric id or MongoDB _id)
    let product;
    if (!isNaN(Number(productId))) {
      product = await Product.findOne({ id: Number(productId) });
    } else {
      product = await Product.findById(productId);
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user._id);
    
    const index = user.wishlist.indexOf(product._id);
    if (index > -1) {
      // Already in wishlist, remove it
      user.wishlist.splice(index, 1);
    } else {
      // Not in wishlist, add it
      user.wishlist.push(product._id);
    }

    await user.save();

    const populatedUser = await User.findById(req.user._id).populate('wishlist');
    return res.json(populatedUser.wishlist);
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return res.status(500).json({ message: error.message });
  }
};
