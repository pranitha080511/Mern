import express from 'express';
import {
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getUserOrdersAdmin,
  getDashboardStats
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/users', getAllUsers);
router.get('/users/:userId/orders', getUserOrdersAdmin);

export default router;
