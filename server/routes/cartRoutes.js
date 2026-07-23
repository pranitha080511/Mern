import express from 'express';
import { getCart, updateCart, mergeCart } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCart);
router.put('/', protect, updateCart);
router.post('/merge', protect, mergeCart);

export default router;
