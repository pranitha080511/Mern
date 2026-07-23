import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, required: true }
}, { collection: 'counters' });

export default mongoose.model('Counter', counterSchema);
