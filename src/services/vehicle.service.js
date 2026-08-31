import { Vehicle } from '../models/Vehicle.model.js';

const listProjection = {
    name: 1, slug: 1, brand_slug: 1, 'images': { $slice: 1 }, 
    price_pkr: 1, prices: 1, status: 1, release_date: 1, 
    'ratings.overall': 1, description: 1, updated_at: 1,
    ev_category: 1, body_type: 1,
    'specs.battery.capacity_usable_kwh': 1, 'specs.battery.capacity_gross_kwh': 1,
    'specs.range_and_efficiency.wltp_combined_km': 1, 'specs.range_and_efficiency.epa_combined_km': 1,
    'specs.powertrain.acceleration_0_100_kmh': 1, 'specs.powertrain.total_power_hp': 1,
    'specs.powertrain.drive_layout': 1
};

export const getAllVehicles = async (query) => {
    let filter = {
        approvalStatus: { $ne: 'REJECTED' }
    };

    // If a specific status filter is requested
    if (query.status) {
        filter.status = new RegExp('^' + query.status.trim() + '$', 'i');
    }

    // Handle budget / max_price filter
    if (query.max_price || query.min_price) {
        filter.price_pkr = {};
        if (query.min_price) filter.price_pkr.$gte = Number(query.min_price);
        if (query.max_price) filter.price_pkr.$lte = Number(query.max_price);
    }

    // Handle brand filter
    if (query.brand) {
        const brands = query.brand.split(',').map(b => new RegExp('^' + b.trim() + '$', 'i'));
        filter.brand_slug = { $in: brands };
    }

    // Handle category filter: matches either ev_category OR body_type (e.g. Scooter, Bike, Car, Cycle)
    if (query.category) {
        const categories = query.category.split(',').map(c => new RegExp('^' + c.trim() + '$', 'i'));
        filter.$or = [
            { ev_category: { $in: categories } },
            { body_type: { $in: categories } }
        ];
    }
    
    if (query.body_type) {
        const bodyTypes = query.body_type.split(',').map(c => new RegExp('^' + c.trim() + '$', 'i'));
        filter.body_type = { $in: bodyTypes };
    }

    // Sorting
    let sort = { updated_at: -1 };
    if (query.sort === 'price_asc') sort = { price_pkr: 1 };
    if (query.sort === 'price_desc') sort = { price_pkr: -1 };
    if (query.sort === 'newest') sort = { release_date: -1 };

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 24;
    const skip = (page - 1) * limit;

    const total = await Vehicle.countDocuments(filter);
    const data = await Vehicle.find(filter, listProjection).sort(sort).skip(skip).limit(limit).lean();

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getVehicleBySlug = async (slug) => {
    const vehicle = await Vehicle.findOne({
        slug,
        approvalStatus: { $ne: 'REJECTED' },
    }).lean();

    if (!vehicle) return null;

    // Fetch sibling trim variants for the same model & brand
    let variants = [];
    if (vehicle.model_name && vehicle.brand_slug) {
        variants = await Vehicle.find({
            brand_slug: vehicle.brand_slug,
            model_name: vehicle.model_name,
            approvalStatus: { $ne: 'REJECTED' },
        })
        .select({
            _id: 1, name: 1, slug: 1, variant_name: 1, price_pkr: 1,
            'specs.battery.capacity_usable_kwh': 1,
            'specs.range_and_efficiency.wltp_combined_km': 1,
            'specs.powertrain.total_power_hp': 1,
            'specs.powertrain.acceleration_0_100_kmh': 1,
            'specs.powertrain.drive_layout': 1,
        })
        .sort({ price_pkr: 1 })
        .lean();
    }

    return {
        vehicle,
        variants,
    };
};

export const getRelatedVehicles = async (slug) => {
    const vehicle = await Vehicle.findOne({ slug }).lean();
    if (!vehicle) return null;

    const baseFilter = {
        slug: { $ne: slug },
        approvalStatus: { $ne: 'REJECTED' },
    };

    // 1. Same brand EVs
    const byBrand = await Vehicle.find({
        ...baseFilter,
        brand_slug: vehicle.brand_slug,
    })
    .select(listProjection)
    .limit(6)
    .lean();

    // 2. Strict same-type matcher (Scooter vs Bike vs Car vs Cycle)
    const isScooter = 
        (vehicle.ev_category && /^scooter$/i.test(vehicle.ev_category)) || 
        (vehicle.body_type && /^scooter$/i.test(vehicle.body_type));

    const isBike = !isScooter && (
        (vehicle.ev_category && /^bike$/i.test(vehicle.ev_category)) || 
        (vehicle.body_type && /^bike$/i.test(vehicle.body_type))
    );

    const isCycle = !isScooter && !isBike && (
        (vehicle.ev_category && /^cycle$/i.test(vehicle.ev_category)) || 
        (vehicle.body_type && /^cycle$/i.test(vehicle.body_type))
    );

    const isRickshaw = !isScooter && !isBike && !isCycle && (
        (vehicle.ev_category && /^rickshaw$/i.test(vehicle.ev_category)) || 
        (vehicle.body_type && /^rickshaw$/i.test(vehicle.body_type))
    );

    let sameTypeMatcher = {};
    if (isScooter) {
        sameTypeMatcher = {
            $or: [
                { ev_category: { $regex: /^scooter$/i } },
                { body_type: { $regex: /^scooter$/i } }
            ]
        };
    } else if (isBike) {
        sameTypeMatcher = {
            $and: [
                { ev_category: { $not: { $regex: /^scooter$/i } } },
                { body_type: { $not: { $regex: /^scooter$/i } } },
                {
                    $or: [
                        { ev_category: { $regex: /^bike$/i } },
                        { body_type: { $regex: /^bike$/i } }
                    ]
                }
            ]
        };
    } else if (isCycle) {
        sameTypeMatcher = {
            $or: [
                { ev_category: { $regex: /^cycle$/i } },
                { body_type: { $regex: /^cycle$/i } }
            ]
        };
    } else if (isRickshaw) {
        sameTypeMatcher = {
            $or: [
                { ev_category: { $regex: /^rickshaw$/i } },
                { body_type: { $regex: /^rickshaw$/i } }
            ]
        };
    } else {
        // Cars and 4-wheelers (strictly excludes two-wheelers/cycles/rickshaws)
        sameTypeMatcher = {
            $and: [
                { ev_category: { $not: { $regex: /^(scooter|bike|cycle|rickshaw)$/i } } },
                { body_type: { $not: { $regex: /^(scooter|bike|cycle|rickshaw)$/i } } }
            ]
        };
    }

    const typeBaseFilter = {
        ...baseFilter,
        ...sameTypeMatcher,
    };

    // 3. Competitors: Same type with price difference of max ±30,000 PKR
    let competitors = [];
    const targetPrice = vehicle.price_pkr;

    if (targetPrice && targetPrice > 0) {
        const minPrice = Math.max(0, targetPrice - 30000);
        const maxPrice = targetPrice + 30000;

        competitors = await Vehicle.find({
            ...typeBaseFilter,
            price_pkr: { $gte: minPrice, $lte: maxPrice }
        })
        .select(listProjection)
        .limit(6)
        .lean();
    }

    // If fewer than 4 vehicles within exact ±30,000, supplement with the closest same-type vehicles by price
    if (competitors.length < 4) {
        const existingIds = competitors.map(c => c._id);
        const remainingLimit = 6 - competitors.length;

        const candidateVehicles = await Vehicle.find({
            ...typeBaseFilter,
            _id: { $nin: existingIds }
        })
        .select(listProjection)
        .limit(20)
        .lean();

        if (targetPrice && targetPrice > 0) {
            candidateVehicles.sort((a, b) => {
                const diffA = Math.abs((a.price_pkr || 0) - targetPrice);
                const diffB = Math.abs((b.price_pkr || 0) - targetPrice);
                return diffA - diffB;
            });
        }

        competitors = [...competitors, ...candidateVehicles.slice(0, remainingLimit)];
    }

    return {
        by_brand: byBrand,
        by_category: competitors,
        by_price: competitors,
    };
};

