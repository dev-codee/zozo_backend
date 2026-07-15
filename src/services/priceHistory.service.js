import { PriceHistory } from '../models/PriceHistory.model.js';

export const getHistoryForPhone = async (phoneSlug) => {
    // Fetch price history
    return await PriceHistory.find({ phone_slug: phoneSlug }).sort({ timestamp: -1 });
};
