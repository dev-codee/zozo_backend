import { Phone } from '../models/Phone.model.js';
import { generatePhoneDescription } from './ai.service.js';

export const getAllPhones = async (query) => {
    let filter = { approvalStatus: 'APPROVED' };
    
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
        sortQuery = { updated_at: -1 };
    }

    let limit = 20;
    if (query.limit) {
        if (query.limit === 'all') {
            limit = 0; // 0 means no limit in mongoose
        } else {
            limit = parseInt(query.limit, 10) || 20;
        }
    }

    // DB logic to fetch and filter phones
    return await Phone.find(filter).sort(sortQuery).limit(limit);
};


export const getPhoneBySlug = async (slug) => {
    // DB logic to fetch a single phone
    const phone = await Phone.findOne({ slug, approvalStatus: 'APPROVED' });
    return phone;
};

export const getPhoneDescription = async (slug) => {
    const phone = await Phone.findOne({ slug, approvalStatus: 'APPROVED' });
    if (!phone) return null;

    if (phone.description) {
        return phone.description;
    }

    const generatedDescription = await generatePhoneDescription(phone.name, phone.specs, phone.tags);
    if (generatedDescription) {
        phone.description = generatedDescription;
        await phone.save();
        return generatedDescription;
    }

    return null;
};

export const getPhonesByBrandSlug = async (brandSlug) => {
    return await Phone.find({ brand_slug: brandSlug, approvalStatus: 'APPROVED' });
};
