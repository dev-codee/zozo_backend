import { Brand } from '../models/Brand.model.js';
import { Phone } from '../models/Phone.model.js';

export const getAllBrands = async () => {
    const brands = await Brand.find().lean();
    
    const phoneCounts = await Phone.aggregate([
        { $match: { approvalStatus: 'APPROVED' } },
        { $group: { _id: "$brand_slug", count: { $sum: 1 } } }
    ]);
    
    const countMap = {};
    phoneCounts.forEach(pc => {
        if (pc._id) {
            countMap[pc._id.toLowerCase()] = pc.count;
        }
    });

    return brands.map(brand => ({
        ...brand,
        total_phones: countMap[brand.slug?.toLowerCase()] || 0
    }));
};

export const getBrandBySlug = async (slug) => {
    // DB logic to fetch a single brand
    return await Brand.findOne({ slug });
};
