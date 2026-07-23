import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const lipbalm = await Product.findOne({ name: /lipbalm/i });
    console.log('LIPBALM PRODUCT IN DB:', lipbalm);
    const all = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('\nLAST 5 PRODUCTS IN DB:');
    all.forEach(p => console.log(`ID: ${p.id} | Name: ${p.name} | Image: "${p.image}"`));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
