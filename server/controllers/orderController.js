import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const { products, totalAmount } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: 'No products in the order' });
  }

  try {
    // Generate next sequential order ID starting from 1001
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    let nextId = 1001;
    if (lastOrder && lastOrder.orderId && !isNaN(Number(lastOrder.orderId))) {
      nextId = Number(lastOrder.orderId) + 1;
    }

    const order = new Order({
      orderId: nextId.toString(),
      user: req.user._id,
      products,
      totalAmount,
      status: 'Processing',
      color: 'bg-yellow-100 text-yellow-700'
    });

    const createdOrder = await order.save();
    return res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
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
