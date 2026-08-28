import env from './src/config/env.js';
import mongoose from 'mongoose';
await mongoose.connect(env.MONGODB_URI,{serverSelectionTimeoutMS:8000});
const a=await mongoose.connection.collection('adminusers').findOne({},{projection:{email:1,role:1}});
console.log('admin:', a && a._id?.toString(), a?.role, a?.email);
await mongoose.disconnect();
