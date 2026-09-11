import { Earbud } from '../models/Earbud.model.js';

const listProjection = {
    name: 1,
    slug: 1,
    brand_slug: 1,
    'images': { $slice: 1 },
    price_pkr: 1,
    prices: 1,
    status: 1,
    release_date: 1,
    rating: 1,
    description: 1,
    updatedAt: 1,
    view_count: 1,
    wearing_type: 1,
    colors: 1,
    tags: 1,
    'specs.audio.driver_type': 1,
    'specs.audio.driver_size_mm': 1,
    'specs.audio.hi_res_audio': 1,
    'specs.audio.spatial_audio': 1,
    'specs.noise_cancellation.has_anc': 1,
    'specs.noise_cancellation.anc_depth_db': 1,
    'specs.noise_cancellation.transparency_mode': 1,
    'specs.battery.total_playtime_with_case_hrs': 1,
    'specs.battery.playtime_earbuds_anc_off_hrs': 1,
    'specs.battery.playtime_earbuds_anc_on_hrs': 1,
    'specs.battery.wireless_charging': 1,
    'specs.battery.fast_charging': 1,
    'specs.connectivity.bluetooth_version': 1,
    'specs.connectivity.codecs': 1,
    'specs.physical.water_resistance': 1,
};

export const getAllEarbuds = async (query = {}) => {
    let filter = { approvalStatus: 'APPROVED' };

    // Price filtering
    if (query.max_price || query.min_price) {
        filter.price_pkr = {};
        if (query.min_price) filter.price_pkr.$gte = Number(query.min_price);
        if (query.max_price) filter.price_pkr.$lte = Number(query.max_price);
    }

    // Brand filtering (comma-separated slugs)
    if (query.brand) {
        const brands = query.brand.split(',').map(b => b.trim());
        filter.brand_slug = { $in: brands };
    }

    // Active Noise Cancellation (ANC) filter
    if (query.has_anc !== undefined) {
        const hasAncVal = query.has_anc === 'true' || query.has_anc === true || query.has_anc === '1';
        filter['specs.noise_cancellation.has_anc'] = hasAncVal;
    }

    // Playtime / Battery life filter (hours)
    if (query.battery || query.playtime) {
        const minHours = parseInt(String(query.battery || query.playtime).match(/\d+/)?.[0], 10);
        if (!isNaN(minHours)) {
            filter['specs.battery.total_playtime_with_case_hrs'] = { $gte: minHours };
        }
    }

    // Water resistance filter (e.g. IPX4, IP54, IP55, etc.)
    if (query.water_resistance) {
        const ipRegex = new RegExp(query.water_resistance.trim(), 'i');
        filter['specs.physical.water_resistance'] = ipRegex;
    }

    // Bluetooth version filter
    if (query.bluetooth) {
        const btRegex = new RegExp(query.bluetooth.trim(), 'i');
        filter['specs.connectivity.bluetooth_version'] = btRegex;
    }

    // Wireless charging filter
    if (query.wireless_charging !== undefined) {
        const wcVal = query.wireless_charging === 'true' || query.wireless_charging === true;
        filter['specs.battery.wireless_charging'] = wcVal;
    }

    // Tag / Category filter
    if (query.tag || query.category) {
        const tag = query.tag || query.category;
        filter.tags = new RegExp(tag.trim(), 'i');
    }

    // Wearing type filter
    if (query.wearing_type) {
        filter.wearing_type = new RegExp(query.wearing_type.trim(), 'i');
    }

    // Upcoming filter (by release date)
    const now = new Date();
    if (query.status === 'upcoming') {
        filter.release_date = { $gt: now };
    } else {
        if (query.status) {
            filter.status = query.status;
        }
        filter.release_date = { $not: { $gt: now } };
    }

    // Sort order
    let sortQuery = { release_date: -1 };
    if (query.sort === 'latest') {
        sortQuery = { release_date: -1 };
    } else if (query.sort === 'trending') {
        sortQuery = { updatedAt: -1 };
    } else if (query.sort === 'popular') {
        sortQuery = { view_count: -1 };
    } else if (query.sort === 'price_asc') {
        sortQuery = { price_pkr: 1 };
    } else if (query.sort === 'price_desc') {
        sortQuery = { price_pkr: -1 };
    }

    // Deterministic pagination tiebreaker
    sortQuery._id = 1;

    let limit = 15;
    if (query.limit) {
        if (query.limit === 'all') {
            limit = 0;
        } else {
            limit = parseInt(query.limit, 10) || 15;
        }
    }

    const page = parseInt(query.page, 10) || 1;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const total = await Earbud.countDocuments(filter);
    const earbuds = await Earbud.find(filter)
        .select(listProjection)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        earbuds,
        pagination: {
            total,
            page,
            limit,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
        },
    };
};

export const getEarbudBySlug = async (slug) => {
    // Atomically increment view_count and return the updated document
    const earbud = await Earbud.findOneAndUpdate(
        { slug, approvalStatus: 'APPROVED' },
        { $inc: { view_count: 1 } },
        { new: true }
    );
    return earbud;
};

export const getRelatedEarbuds = async (slug) => {
    const earbud = await Earbud.findOne({ slug, approvalStatus: 'APPROVED' });
    if (!earbud) return null;

    const baseFilter = { slug: { $ne: slug }, approvalStatus: 'APPROVED' };

    // Same brand earbuds
    let byBrand = [];
    if (earbud.brand_slug) {
        byBrand = await Earbud.find({
            ...baseFilter,
            brand_slug: earbud.brand_slug,
        }).select(listProjection).limit(6).lean();
    }

    // Similar price bracket (within ±40%)
    let byPrice = [];
    if (earbud.price_pkr && earbud.price_pkr > 0) {
        const minP = earbud.price_pkr * 0.6;
        const maxP = earbud.price_pkr * 1.4;
        byPrice = await Earbud.find({
            ...baseFilter,
            brand_slug: { $ne: earbud.brand_slug },
            price_pkr: { $gte: minP, $lte: maxP },
        }).select(listProjection).limit(6).lean();
    }

    return {
        by_brand: byBrand,
        by_price: byPrice,
    };
};

export const getEarbudsByBrandSlug = async (brandSlug) => {
    return await Earbud.find({ brand_slug: brandSlug, approvalStatus: 'APPROVED' })
        .select(listProjection)
        .lean();
};
