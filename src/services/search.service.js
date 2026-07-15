import { Phone } from '../models/Phone.model.js';

export const performSearch = async (queryStr) => {
    // Text search logic
    return await Phone.find({ $text: { $search: queryStr } });
};
