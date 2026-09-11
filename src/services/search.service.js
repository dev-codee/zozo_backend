import { Phone } from '../models/Phone.model.js';
import { Earbud } from '../models/Earbud.model.js';

export const performSearch = async (queryStr) => {
    // Regex search for partial matches, case-insensitive
    const regex = new RegExp(queryStr, 'i');

    const [phones, earbuds] = await Promise.all([
        Phone.find({
            approvalStatus: 'APPROVED',
            $or: [
                { name: { $regex: regex } },
                { brand_slug: { $regex: regex } },
            ],
        })
            .limit(15)
            .lean(),

        Earbud.find({
            approvalStatus: 'APPROVED',
            is_published: true,
            $or: [
                { name: { $regex: regex } },
                { brand_slug: { $regex: regex } },
            ],
        })
            .limit(10)
            .lean(),
    ]);

    const formattedPhones = phones.map((p) => ({ ...p, item_type: 'phone' }));
    const formattedEarbuds = earbuds.map((e) => ({ ...e, item_type: 'earbud' }));

    return [...formattedPhones, ...formattedEarbuds];
};
