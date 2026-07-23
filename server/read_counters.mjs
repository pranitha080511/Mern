import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
(async ()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const docs = await db.collection('counters').find({}).toArray();
    console.log(JSON.stringify(docs, null, 2));
    await mongoose.disconnect();
  }catch(err){ console.error(err); process.exit(1); }
})();