import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Brand } from '../models/Brand.model.js';
import { slugify } from '../utils/slugify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Popular EV manufacturers: global + Chinese + brands active/expected in the
// Pakistan market, plus local electric two-wheeler brands (bikes/scooters/cycles).
const brandNames = [
    // Global cars
    'Tesla', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Volvo',
    'Polestar', 'Rivian', 'Lucid', 'Ford', 'Nissan', 'Toyota', 'Honda',
    'Hyundai', 'Kia', 'Jaguar', 'Peugeot', 'Renault',
    // Chinese cars (many entering / sold in Pakistan)
    'BYD', 'MG', 'Xiaomi', 'Deepal', 'Xpeng', 'Nio', 'Zeekr', 'Li Auto', 'Aion',
    'Wuling', 'Chery', 'Haval', 'GAC', 'Changan', 'BAIC', 'Dongfeng', 'Leapmotor',
    'JAC', 'Seres', 'Avatr', 'Hongqi', 'Ora', 'Neta', 'Jetour',
    // Electric two-wheelers (bikes / scooters)
    'Yadea', 'Jolta', 'Vlektra', 'Metro', 'Evee', 'Benling', 'Ather',
    'Ola Electric', 'Revolt', 'NIU', 'Super Power', 'Road Prince',
];

const brands = brandNames.map(name => ({
    name,
    slug: slugify(name),
    type: 'ev',
}));

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        let created = 0;
        let updated = 0;
        for (const b of brands) {
            const existing = await Brand.findOne({ slug: b.slug });
            if (existing) {
                // Promote/ensure the EV type without clobbering an existing logo/desc.
                if (existing.type !== 'ev') {
                    existing.type = 'ev';
                    await existing.save();
                    updated++;
                    console.log(`Updated brand -> ev: ${b.slug}`);
                } else {
                    console.log(`Brand already exists (skipped): ${b.slug}`);
                }
            } else {
                await Brand.create(b);
                created++;
                console.log(`Created EV brand: ${b.slug}`);
            }
        }

        console.log(`\nDone. Created ${created}, updated ${updated}, total ${brands.length}.`);
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
