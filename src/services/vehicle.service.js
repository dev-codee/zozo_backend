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

    // 2. Same category / competitors (e.g. Car vs Car, Bike vs Bike)
    const categoryFilter = {
        ...baseFilter,
        ev_category: vehicle.ev_category || 'Car',
    };
    if (vehicle.body_type) {
        categoryFilter.body_type = vehicle.body_type;
    }
    let byCategory = await Vehicle.find(categoryFilter)
        .select(listProjection)
        .limit(6)
        .lean();

    // Fallback if specific body_type has few results
    if (byCategory.length < 3 && vehicle.ev_category) {
        byCategory = await Vehicle.find({
            ...baseFilter,
            ev_category: vehicle.ev_category,
        })
        .select(listProjection)
        .limit(6)
        .lean();
    }

    // 3. Similar Price Range (within ± 25% if price_pkr exists)
    let byPrice = [];
    if (vehicle.price_pkr && vehicle.price_pkr > 0) {
        const minP = Math.round(vehicle.price_pkr * 0.75);
        const maxP = Math.round(vehicle.price_pkr * 1.25);
        byPrice = await Vehicle.find({
            ...baseFilter,
            price_pkr: { $gte: minP, $lte: maxP },
        })
        .select(listProjection)
        .limit(6)
        .lean();
    }

    return {
        by_brand: byBrand,
        by_category: byCategory,
        by_price: byPrice,
    };
};

