import env from './src/config/env.js';
import mongoose from 'mongoose';
await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
const Phone = mongoose.connection.collection('phones');
const total = await Phone.countDocuments();
const byBrand = await Phone.aggregate([
  { $group: { _id: '$brand_slug', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]).toArray();
console.log('TOTAL phones:', total);
for (const b of byBrand) console.log(`  ${b._id}: ${b.count}`);
await mongoose.disconnect();
