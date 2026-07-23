import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Feedback from './models/Feedback.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('--- PRODUCTS IN DB ---');
    const products = await Product.find({}).sort({ createdAt: -1 });
    products.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Image: "${p.image}"`));

    console.log('\n--- FEEDBACKS IN DB ---');
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    feedbacks.forEach(f => console.log(`ID: ${f._id} | OrderId: ${f.orderId} | Rating: ${f.rating} | Photo: "${f.photo}"`));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
