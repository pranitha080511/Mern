import Order from '../models/Order.js';
import mongoose from 'mongoose';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { products, totalAmount } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: 'No products in the order' });
  }

  try {
    // Use an atomic counter document to generate a sequential orderId.
    // Initialize the counter from the current maximum numeric orderId in the orders
    // collection to avoid generating values that already exist (handles older data).
    // Determine current max numeric orderId (only consider purely numeric orderIds)
    // Default starting sequence if counters document is absent
    const currentMax = 1000;

    // Generate a collision-resistant orderId using timestamp + randomness
    const nextId = `${Date.now()}${Math.floor(Math.random() * 9000) + 1000}`;

    // Try saving the order; on duplicate-key (rare), try a few times by incrementing the counter further.
    let createdOrder = null;
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const order = new Order({
          orderId: nextId.toString(),
          user: req.user._id,
          products,
          totalAmount,
          status: 'Processing',
          color: 'bg-yellow-100 text-yellow-700'
        });

        createdOrder = await order.save();
        break;
      } catch (saveErr) {
        // Duplicate key on orderId — increment counter and retry
        if (saveErr && saveErr.code === 11000 && attempt < MAX_RETRIES - 1) {
          const nextCounter = await counterColl.findOneAndUpdate(
            { _id: 'orderId' },
            { $inc: { seq: 1 } },
            { returnDocument: 'after' }
          );
          nextId = (nextCounter && nextCounter.value && nextCounter.value.seq) ? nextCounter.value.seq : Date.now();
          console.warn(`Duplicate orderId encountered. Retrying with orderId=${nextId} (attempt ${attempt + 1})`);
          continue;
        }
        // Re-throw other errors
        throw saveErr;
      }
    }

    if (!createdOrder) {
      throw new Error('Could not create order after retrying');
    }

    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    // Handle duplicate key on orderId explicitly
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'Duplicate orderId generated. Please retry the request.' });
    }
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    return res.status(500).json({ message: error.message });
  }
};
