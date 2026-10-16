import { getExchangeRates } from './exchangeRates.service.js';
import ApiError from '../utils/ApiError.js';

const positive = field => ({ $cond: [{ $gt: [field, 0] }, field, null] });
export function priceExpression(currency, pkrRate) {
    const retailer = { $min: { $map: { input: { $filter: { input: { $ifNull: ['$prices', []] }, as: 'p', cond: { $gt: ['$$p.price_pkr', 0] } } }, as: 'p', in: '$$p.price_pkr' } } };
    const local = { $ifNull: [positive('$price_pkr'), retailer] };
    const usd = { $ifNull: [positive('$price_usd'), positive('$pricing.price_global_base_usd')] };
    // URL budgets remain PKR-equivalent for compatibility with existing links.
    const globalPkr = pkrRate ? { $multiply: [usd, pkrRate] } : null;
    return currency === 'PKR' ? { $ifNull: [local, globalPkr] } : { $ifNull: [globalPkr, local] };
}

export async function pricedList(Model, filter, projection, sort, skip, limit, query) {
    const priceFilter = filter.price_pkr;
    delete filter.price_pkr;
    const needsPrice = !!priceFilter || Object.hasOwn(sort, 'price_pkr');
    if (!needsPrice) {
        const [total, items] = await Promise.all([
            Model.countDocuments(filter), Model.find(filter).select(projection).sort(sort).skip(skip).limit(limit).lean(),
        ]);
        return { total, items };
    }
    for (const value of Object.values(priceFilter || {})) {
        if (!Number.isFinite(value) || value < 0) throw new ApiError(400, 'Invalid price range');
    }
    const { rates } = await getExchangeRates();
    if (!rates.PKR) throw new ApiError(503, 'Price filtering is temporarily unavailable; exchange rates are unavailable');
    const pipeline = [{ $match: filter }, { $set: { _effectivePrice: priceExpression(query.display_currency || 'USD', rates.PKR), _sortPrice: priceExpression('USD', rates.PKR) } }];
    if (priceFilter) pipeline.push({ $match: { _effectivePrice: { $ne: null, ...priceFilter } } });
    const order = Object.fromEntries(Object.entries(sort).map(([key, value]) => [key === 'price_pkr' ? '_sortPrice' : key, value]));
    // Unknown prices sort last in either direction.
    pipeline.push({ $set: { _missingPrice: { $cond: [{ $gt: ['$_sortPrice', 0] }, 0, 1] } } });
    const page = [{ $sort: { ...(Object.hasOwn(sort, 'price_pkr') ? { _missingPrice: 1 } : {}), ...order } }, { $skip: Math.max(0, skip) }];
    if (limit > 0) page.push({ $limit: limit });
    const aggregateProjection = { ...projection };
    if (projection.images) aggregateProjection.images = { $slice: [{ $ifNull: ['$images', []] }, 1] };
    page.push({ $project: aggregateProjection });
    pipeline.push({ $facet: { items: page, count: [{ $count: 'total' }] } });
    const [result] = await Model.aggregate(pipeline);
    return { items: result.items, total: result.count[0]?.total || 0 };
}
