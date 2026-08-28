import env from './src/config/env.js';
import mongoose from 'mongoose';
import fs from 'fs';
const ADMIN = '6a61078988bf1cb694658f97';
await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
const revIds = (await mongoose.connection.collection('phonerevisions').distinct('phoneId', {
  note: 'Bulk spec re-generation (specs-only, web-grounded)'
})).map((x) => x.toString());
// keep only those whose spec-save actually landed (updatedBy persisted)
const savedIds = (await mongoose.connection.collection('phones').find(
  { _id: { $in: revIds.map((s) => new mongoose.Types.ObjectId(s)) }, updatedBy: new mongoose.Types.ObjectId(ADMIN) },
  { projection: { _id: 1 } }
).toArray()).map((d) => d._id.toString());
fs.writeFileSync('specs_regen_progress.json', JSON.stringify({ done: savedIds }, null, 2));
console.log('revisions:', revIds.length, '| actually-saved (will SKIP):', savedIds.length, '| revision-only (will RETRY):', revIds.length - savedIds.length);
await mongoose.disconnect();
