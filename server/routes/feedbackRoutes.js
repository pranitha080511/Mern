import express from 'express';
import { submitFeedback, getFeedbackByOrder, getAllFeedback } from '../controllers/feedbackController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('photo'), submitFeedback);
router.get('/order/:orderId', protect, getFeedbackByOrder);
router.get('/all', protect, adminOnly, getAllFeedback);

export default router;
