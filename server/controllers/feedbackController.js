import Feedback from '../models/Feedback.js';
import Order from '../models/Order.js';
import { sendFeedbackEmail } from '../services/emailService.js';

export const submitFeedback = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate order exists, belongs to user, and is delivered
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (order.status !== 'Delivered') {
      return res.status(400).json({ message: 'Can only review delivered orders' });
    }

    // Check no duplicate feedback
    const existingFeedback = await Feedback.findOne({ user: userId, order: orderId });
    if (existingFeedback) {
      return res.status(400).json({ message: 'Feedback already submitted for this order' });
    }

    let photoPath = '';
    let photoUrl = '';
    if (req.file) {
      photoPath = req.file.path;
      photoUrl = `/uploads/feedback/${req.file.filename}`;
    }

    // Determine readable orderId for display
    const displayOrderId = order.orderId || (order._id.toString().substring(0, 8));

    // Save feedback
    const feedback = new Feedback({
      user: userId,
      order: orderId,
      orderId: displayOrderId,
      rating,
      comment,
      photo: photoUrl
    });

    await feedback.save();

    // Call email service
    await sendFeedbackEmail({
      userName: req.user.fullName || req.user.name || 'Customer',
      userEmail: req.user.email,
      orderId: displayOrderId,
      rating: Number(rating),
      comment,
      photoPath
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getFeedbackByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({ user: userId, order: orderId });
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({})
      .populate('user', 'fullName email')
      .populate('order', 'orderId products totalAmount')
      .sort({ createdAt: -1 });

    res.status(200).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
