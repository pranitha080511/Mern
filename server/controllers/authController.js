import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { fullName, email, password, phone, dob, gender, skinType } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      dob,
      gender,
      skinType
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        skinType: user.skinType,
        wishlist: user.wishlist,
        cart: user.cart,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email })
      .populate({
        path: 'cart.product',
        model: 'Product'
      })
      .populate('wishlist');

    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        skinType: user.skinType,
        wishlist: user.wishlist,
        cart: user.cart,
        isAdmin: user.isAdmin,
        token: generateToken(user._id)
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'cart.product',
        model: 'Product'
      })
      .populate('wishlist');

    if (user) {
      return res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        skinType: user.skinType,
        wishlist: user.wishlist,
        cart: user.cart,
        isAdmin: user.isAdmin
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
      user.gender = req.body.gender || user.gender;
      user.address = req.body.address !== undefined ? req.body.address : user.address;
      user.skinType = req.body.skinType || user.skinType;

      const updatedUser = await user.save();

      // Populate populated fields again to send back
      const populatedUser = await User.findById(updatedUser._id)
        .populate({
          path: 'cart.product',
          model: 'Product'
        })
        .populate('wishlist');

      return res.json({
        _id: populatedUser._id,
        fullName: populatedUser.fullName,
        email: populatedUser.email,
        phone: populatedUser.phone,
        dob: populatedUser.dob,
        gender: populatedUser.gender,
        address: populatedUser.address,
        skinType: populatedUser.skinType,
        wishlist: populatedUser.wishlist,
        cart: populatedUser.cart
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/change-password
// @access  Private
export const updateUserPassword = async (req, res) => {
  const { current, new: newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const isMatch = await user.matchPassword(current);

      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = newPassword;
      await user.save();

      return res.json({ message: 'Password updated successfully' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: error.message });
  }
};
