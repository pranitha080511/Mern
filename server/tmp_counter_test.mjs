import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
(async ()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    console.log('connected');
    try { await db.collection('counters').deleteMany({}); } catch(e){}
    try{
      const ins = await db.collection('counters').insertOne({_id:'orderId', seq:1000});
      console.log('inserted', ins.insertedId);
    }catch(e){ console.error('insertErr', e); }
    try{
      const r = await db.collection('counters').findOneAndUpdate({_id:'orderId'}, {$inc:{seq:1}}, {returnDocument:'after'});
      console.log('after', r);
    }catch(e){ console.error('incErr', e); }
    await mongoose.disconnect();
  }catch(err){ console.error(err); process.exit(1); }
})();