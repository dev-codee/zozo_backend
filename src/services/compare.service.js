import { Phone } from '../models/Phone.model.js';
import Comparison from '../models/Comparison.model.js';

export const comparePhonesList = async (phoneSlugs) => {
    if (!phoneSlugs || phoneSlugs.length === 0) {
        return [];
    }
    
    // Fetch all matching phones from DB
    const phones = await Phone.find({ slug: { $in: phoneSlugs } });
    
    // Map them for quick lookup
    const phonesMap = {};
    phones.forEach((phone) => {
        phonesMap[phone.slug] = phone;
    });
    
    // Return phones ordered as requested (exclude any that weren't found)
    return phoneSlugs
        .map((slug) => phonesMap[slug])
        .filter((phone) => !!phone);
};

export const trackComparison = async (phoneSlugs) => {
    if (!phoneSlugs || phoneSlugs.length < 2) return null;
    
    // Sort slugs alphabetically to avoid A vs B and B vs A being different
    const sortedSlugs = [...phoneSlugs].sort();
    
    const phones = await Phone.find({ slug: { $in: sortedSlugs } });
    if (phones.length !== sortedSlugs.length) {
        // Some phones were not found, do not track
        return null;
    }
    const phoneIds = phones.map(p => p._id);
    
    const updated = await Comparison.findOneAndUpdate(
        { slugs: sortedSlugs },
        { 
            $inc: { hits: 1 },
            $setOnInsert: { phones: phoneIds }
        },
        { upsert: true, new: true }
    );
    return updated;
};

export const getPopularComparisons = async (limit = 10) => {
    return await Comparison.find({})
        .sort({ hits: -1 })
        .limit(limit)
        .populate('phones', 'slug name images brand_slug prices specs.display.size_inches specs.performance.ram_options_gb specs.performance.storage_options_gb specs.battery.capacity_mah specs.camera.rear_summary');
};
