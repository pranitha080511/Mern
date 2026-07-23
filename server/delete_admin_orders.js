import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';

dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const res = await Order.deleteMany({ orderId: { $in: ['1005', '1006'] } });
    console.log(`Deleted ${res.deletedCount} order(s) (orderId 1005, 1006).`);

    const remaining = await Order.find({}).sort({ createdAt: -1 });
    console.log('Remaining orders count:', remaining.length);
    console.log('Remaining order IDs:', remaining.map(o => o.orderId));
  } catch (err) {
    console.error('Delete error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
