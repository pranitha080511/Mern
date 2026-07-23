import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product'
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user.cart);
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update user cart
// @route   PUT /api/cart
// @access  Private
export const updateCart = async (req, res) => {
  const { cartItems } = req.body; // Expects array of { id, quantity }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dbCartItems = [];
    for (const item of cartItems) {
      const id = item.id || item.productId;
      if (!id) continue;

      let product;
      if (!isNaN(Number(id))) {
        product = await Product.findOne({ id: Number(id) });
      } else {
        product = await Product.findById(id);
      }

      if (product) {
        dbCartItems.push({
          product: product._id,
          quantity: Number(item.quantity) || 1
        });
      }
    }

    user.cart = dbCartItems;
    await user.save();

    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product'
    });

    return res.json(populatedUser.cart);
  } catch (error) {
    console.error('Update cart error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Merge guest cart into user cart
// @route   POST /api/cart/merge
// @access  Private
export const mergeCart = async (req, res) => {
  const { guestCart } = req.body; // Expects array of { id, quantity }

  if (!guestCart || !Array.isArray(guestCart) || guestCart.length === 0) {
    return res.json({ message: 'Nothing to merge' });
  }

  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product'
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert existing user cart to map for easy lookup by product ID
    const cartMap = new Map();
    for (const item of user.cart) {
      if (item.product) {
        cartMap.set(item.product.id, item);
      }
    }

    // Merge guest cart items
    for (const guestItem of guestCart) {
      const id = guestItem.id;
      if (!id) continue;

      let product;
      if (!isNaN(Number(id))) {
        product = await Product.findOne({ id: Number(id) });
      } else {
        product = await Product.findById(id);
      }

      if (product) {
        if (cartMap.has(product.id)) {
          // If item exists, add the quantity
          const existingItem = cartMap.get(product.id);
          existingItem.quantity += Number(guestItem.quantity) || 1;
        } else {
          // If not exists, insert new item
          user.cart.push({
            product: product._id,
            quantity: Number(guestItem.quantity) || 1
          });
        }
      }
    }

    await user.save();

    const populatedUser = await User.findById(req.user._id).populate({
      path: 'cart.product',
      model: 'Product'
    });

    return res.json(populatedUser.cart);
  } catch (error) {
    console.error('Merge cart error:', error);
    return res.status(500).json({ message: error.message });
  }
};
