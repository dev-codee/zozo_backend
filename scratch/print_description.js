import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Phone } from '../src/models/Phone.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const printDesc = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const phone = await Phone.findOne({ description: { $exists: true, $ne: '' } });
        if (phone) {
            console.log(`Phone: ${phone.name}`);
            console.log('--- DESCRIPTION START ---');
            console.log(phone.description.substring(0, 1000));
            console.log('--- DESCRIPTION END ---');
        } else {
            console.log("No phone with a description found.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

printDesc();
