import mongoose from 'mongoose';

const connectDB = async (retries = 5) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection warning: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying MongoDB connection in 3 seconds... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 3000);
    } else {
      console.error('MongoDB connection failed after retries. Express server will remain active.');
    }
  }
};

export default connectDB;
