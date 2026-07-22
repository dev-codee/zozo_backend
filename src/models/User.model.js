import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    lastLogin: { type: Date }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
