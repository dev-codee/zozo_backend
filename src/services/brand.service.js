import { Brand } from '../models/Brand.model.js';
import { Phone } from '../models/Phone.model.js';
import { Vehicle } from '../models/Vehicle.model.js';

export const getAllBrands = async (query = {}) => {
    // EV brands are explicitly type 'ev'. Everything else (including legacy brands
    // with no `type` field) is treated as the phone vertical, so public phone
    // pages that call /brands without a type never see EV brands.
    if (query.type === 'ev') {
        const brands = await Brand.find({ type: 'ev' }).lean();

        const vehicleCounts = await Vehicle.aggregate([
            { $match: { approvalStatus: 'APPROVED' } },
            { $group: { _id: "$brand_slug", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        vehicleCounts.forEach(vc => {
            if (vc._id) countMap[vc._id.toLowerCase()] = vc.count;
        });

        return brands.map(brand => ({
            ...brand,
            total_vehicles: countMap[brand.slug?.toLowerCase()] || 0
        }));
    }

    const brands = await Brand.find({ type: { $ne: 'ev' } }).lean();

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
