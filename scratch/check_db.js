import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Comparison from '../src/models/Comparison.model.js';
import { Phone } from '../src/models/Phone.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB successfully.");

        const comparisonsCount = await Comparison.countDocuments();
        console.log(`Total comparisons tracked: ${comparisonsCount}`);

        const comparisons = await Comparison.find({}).populate('phones');
        console.log("Tracked Comparisons in DB:");
        comparisons.forEach(comp => {
            console.log(`Slugs: ${comp.slugs.join(' vs ')}, Hits: ${comp.hits}, Phones Count (populated): ${comp.phones ? comp.phones.length : 0}`);
            if (comp.phones) {
                comp.phones.forEach(p => {
                    if (p) {
                        console.log(`  - Phone: ${p.name}, Status: ${p.approvalStatus}`);
                    } else {
                        console.log(`  - Phone: NULL (missing/deleted referenced phone)`);
                    }
                });
            }
        });

        const unapprovedPhones = await Phone.find({ approvalStatus: { $ne: 'APPROVED' } });
        console.log(`Unapproved phones count: ${unapprovedPhones.length}`);
        unapprovedPhones.forEach(p => {
            console.log(`  - Phone: ${p.name}, Status: ${p.approvalStatus}`);
        });

        const approvedPhonesCount = await Phone.countDocuments({ approvalStatus: 'APPROVED' });
        console.log(`Approved phones count: ${approvedPhonesCount}`);

        process.exit(0);
    } catch (err) {
        console.error("Error checking DB:", err);
        process.exit(1);
    }
};

check();
