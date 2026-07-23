import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, maxlength: 1000 },
  photo: { type: String, default: '' },
}, { timestamps: true });

feedbackSchema.index({ user: 1, order: 1 }, { unique: true });

export default mongoose.model('Feedback', feedbackSchema);
