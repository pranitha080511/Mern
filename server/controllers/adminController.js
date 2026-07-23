import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    let orders = await Order.find(query)
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 });

    // Search by orderId or customer name/email
    if (search) {
      const lower = search.toLowerCase();
      orders = orders.filter(o =>
        o.orderId.toLowerCase().includes(lower) ||
        (o.user && o.user.fullName && o.user.fullName.toLowerCase().includes(lower)) ||
        (o.user && o.user.email && o.user.email.toLowerCase().includes(lower))
      );
    }

    const total = orders.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = orders.slice(startIndex, startIndex + Number(limit));

    return res.json({
      orders: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const statusColorMap = {
      Processing: 'bg-yellow-100 text-yellow-700',
      Shipped: 'bg-blue-100 text-blue-700',
      Delivered: 'bg-green-100 text-green-700'
    };

    const validStatuses = Object.keys(statusColorMap);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.color = statusColorMap[status];
    const updatedOrder = await order.save();

    return res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).select('-password').sort({ createdAt: -1 });

    // Get order counts per user
    const userIds = users.map(u => u._id);
    const orderCounts = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } }
    ]);

    const countMap = {};
    orderCounts.forEach(o => {
      countMap[o._id.toString()] = { count: o.count, totalSpent: o.totalSpent };
    });

    const usersWithStats = users.map(u => ({
      _id: u._id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      gender: u.gender,
      skinType: u.skinType,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      orderCount: countMap[u._id.toString()]?.count || 0,
      totalSpent: countMap[u._id.toString()]?.totalSpent || 0
    }));

    return res.json(usersWithStats);
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for a specific user (admin)
// @route   GET /api/admin/users/:userId/orders
// @access  Admin
export const getUserOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error('Get user orders (admin) error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/admin/stats
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalRevenue, statusBreakdown, recentOrders, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'fullName email'),
      User.countDocuments({ isAdmin: false })
    ]);

    const statusMap = { Processing: 0, Shipped: 0, Delivered: 0 };
    statusBreakdown.forEach(s => { statusMap[s._id] = s.count; });

    return res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      processing: statusMap.Processing,
      shipped: statusMap.Shipped,
      delivered: statusMap.Delivered,
      totalUsers,
      recentOrders
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an order (admin)
// @route   DELETE /api/admin/orders/:id
// @access  Admin
export const deleteOrderAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await Order.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return res.status(500).json({ message: error.message });
  }
};
