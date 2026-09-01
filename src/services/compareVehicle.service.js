import { Vehicle } from '../models/Vehicle.model.js';
import VehicleComparison from '../models/VehicleComparison.model.js';

// EVs use the same "not rejected" visibility rule as the public listing
// (vehicle.service.js) rather than the phones' strict APPROVED gate.
const VISIBLE = { approvalStatus: { $ne: 'REJECTED' } };

export const compareVehiclesList = async (vehicleSlugs) => {
    if (!vehicleSlugs || vehicleSlugs.length === 0) {
        return [];
    }

    const vehicles = await Vehicle.find({ slug: { $in: vehicleSlugs }, ...VISIBLE }).lean();

    const vehiclesMap = {};
    vehicles.forEach((vehicle) => {
        vehiclesMap[vehicle.slug] = vehicle;
    });

    // Preserve the requested order and drop any slug that wasn't found.
    return vehicleSlugs
        .map((slug) => vehiclesMap[slug])
        .filter((vehicle) => !!vehicle);
};

export const trackVehicleComparison = async (vehicleSlugs) => {
    if (!vehicleSlugs || vehicleSlugs.length < 2) return null;

    // Sort so "a vs b" and "b vs a" collapse into one tracked matchup.
    const sortedSlugs = [...vehicleSlugs].sort();

    const vehicles = await Vehicle.find({ slug: { $in: sortedSlugs }, ...VISIBLE });
    if (vehicles.length !== sortedSlugs.length) {
        return null;
    }
    const vehicleIds = vehicles.map((v) => v._id);

    const updated = await VehicleComparison.findOneAndUpdate(
        { slugs: sortedSlugs },
        {
            $inc: { hits: 1 },
            $setOnInsert: { vehicles: vehicleIds },
        },
        { upsert: true, new: true }
    );
    return updated;
};

export const getPopularVehicleComparisons = async (limit = 10) => {
    return await VehicleComparison.find({})
        .sort({ hits: -1 })
        .limit(limit)
        .populate({
            path: 'vehicles',
            match: VISIBLE,
            select: 'slug name images brand_slug ev_category body_type prices price_pkr specs.battery.capacity_usable_kwh specs.range_and_efficiency.wltp_combined_km specs.powertrain.total_power_hp specs.powertrain.acceleration_0_100_kmh',
        });
};
