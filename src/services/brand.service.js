import { Brand } from '../models/Brand.model.js';

export const getAllBrands = async () => {
    // DB logic to fetch brands
    return await Brand.find();
};

export const getBrandBySlug = async (slug) => {
    // DB logic to fetch a single brand
    return await Brand.findOne({ slug });
};
