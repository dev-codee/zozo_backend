import { Phone } from '../models/Phone.model.js';

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
