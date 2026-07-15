import { Phone } from '../models/Phone.model.js';

export const getAllPhones = async (query) => {
    // DB logic to fetch and filter phones
    return await Phone.find().limit(10);
};

export const getPhoneBySlug = async (slug) => {
    // DB logic to fetch a single phone
    return await Phone.findOne({ slug });
};
