import { Phone } from '../models/Phone.model.js';

export const performSearch = async (queryStr) => {
    // Regex search for partial matches, case-insensitive
    const regex = new RegExp(queryStr, 'i');
    return await Phone.find({
        approvalStatus: 'APPROVED',
        $or: [
            { name: { $regex: regex } },
            { brand_slug: { $regex: regex } }
        ]
    }).limit(20);
};
