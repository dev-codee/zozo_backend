import { Phone } from '../models/Phone.model.js';
import { generatePhoneDescription } from './ai.service.js';

export const getAllPhones = async (query) => {
    let filter = {};
    
    // Handle budget / max_price filter
    if (query.max_price || query.min_price) {
        filter['prices.price_pkr'] = {};
        if (query.min_price) filter['prices.price_pkr'].$gte = Number(query.min_price);
        if (query.max_price) filter['prices.price_pkr'].$lte = Number(query.max_price);
    }
    
    // Handle brand filter (comma separated slugs)
    if (query.brand) {
        const brands = query.brand.split(',').map(b => b.trim());
        filter.brand_slug = { $in: brands };
    }
    
    let sortQuery = {};
    if (query.sort === 'latest') {
        sortQuery = { release_date: -1 };
    } else if (query.sort === 'trending') {
        // Mock trending by sorting by rating count or something if available
        // For now, let's just sort randomly or by updated_at
        sortQuery = { updated_at: -1 };
    }

    // DB logic to fetch and filter phones
    return await Phone.find(filter).sort(sortQuery).limit(20);
};


export const getPhoneBySlug = async (slug) => {
    // DB logic to fetch a single phone
    const phone = await Phone.findOne({ slug });
    if (!phone) return null;

    if (!phone.description) {
        const generatedDescription = await generatePhoneDescription(phone.name, phone.specs);
        if (generatedDescription) {
            phone.description = generatedDescription;
            await phone.save();
        }
    }

    return phone;
};

export const getPhonesByBrandSlug = async (brandSlug) => {
    return await Phone.find({ brand_slug: brandSlug });
};
