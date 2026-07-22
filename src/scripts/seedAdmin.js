import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AdminUser } from '../models/AdminUser.model.js';
import { Phone } from '../models/Phone.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Create Super Admin
        const existingAdmin = await AdminUser.findOne({ username: 'superzozoadmin' });
        let superAdminId;
        
        if (!existingAdmin) {
            const admin = await AdminUser.create({
                username: 'superzozoadmin',
                email: 'admin@zozo.pk',
                password: '2yYN;6£10%', // Will be hashed by pre-save hook
                name: 'Super Admin',
                role: 'SUPER_ADMIN',
                permissions: ['all']
            });
            superAdminId = admin._id;
            console.log("Super Admin created.");
        } else {
            superAdminId = existingAdmin._id;
            console.log("Super Admin already exists.");
        }

        // 2. Migrate existing phones to APPROVED status
        const result = await Phone.updateMany(
            { approvalStatus: { $exists: false } },
            { 
                $set: { 
                    approvalStatus: 'APPROVED',
                    createdBy: superAdminId
                } 
            }
        );
        console.log(`Migrated ${result.modifiedCount} phones to APPROVED status.`);

        process.exit(0);
    } catch (error) {
        console.error("Seed error:", error);
        process.exit(1);
    }
};

seed();
