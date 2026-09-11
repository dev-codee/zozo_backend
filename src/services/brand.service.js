import { Brand } from '../models/Brand.model.js';
import { Phone } from '../models/Phone.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { Earbud } from '../models/Earbud.model.js';

export const getAllBrands = async (query = {}) => {
    // EV brands are explicitly type 'ev'.
    if (query.type === 'ev') {
        const brands = await Brand.find({ type: 'ev' }).sort({ name: 1 }).lean();

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

    // Earbud brands: brands explicitly marked 'earbud', or general tech/phone brands that also make earbuds
    if (query.type === 'earbud' || query.type === 'earbuds') {
        const earbudCounts = await Earbud.aggregate([
            { $match: { approvalStatus: 'APPROVED' } },
            { $group: { _id: "$brand_slug", count: { $sum: 1 } } }
        ]);

        const countMap = {};
        earbudCounts.forEach(ec => {
            if (ec._id) countMap[ec._id.toLowerCase()] = ec.count;
        });

        const activeSlugs = Object.keys(countMap);
        // Include any brand typed as 'earbud' OR any brand currently having approved earbuds
        const brands = await Brand.find({
            $or: [
                { type: 'earbud' },
                { slug: { $in: activeSlugs } },
                { type: { $ne: 'ev' } } // allow selecting existing phone brands like Apple, Samsung, etc. in admin/filter
            ]
        }).sort({ name: 1 }).lean();

        return brands.map(brand => ({
            ...brand,
            total_earbuds: countMap[brand.slug?.toLowerCase()] || 0
        }));
    }

    const brands = await Brand.find({ type: { $ne: 'ev' } }).sort({ name: 1 }).lean();

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
    return await Brand.findOne({ slug });
};
