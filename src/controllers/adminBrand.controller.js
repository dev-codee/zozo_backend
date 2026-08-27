import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Brand } from '../models/Brand.model.js';
import { Phone } from '../models/Phone.model.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { slugify } from '../utils/slugify.js';

// ─── LIST (with usage counts) ────────────────────────────────────────────────────

export const getBrandsAdmin = asyncHandler(async (req, res) => {
    const { type, search } = req.query;

    const query = {};
    // Legacy brands (no type) are treated as 'phone'.
    if (type === 'ev') query.type = 'ev';
    else if (type === 'phone') query.type = { $ne: 'ev' };
    if (search) query.name = { $regex: search, $options: 'i' };

    const brands = await Brand.find(query).sort({ name: 1 }).lean();

    // Attach how many phones / vehicles reference each brand slug.
    const [phoneCounts, vehicleCounts] = await Promise.all([
        Phone.aggregate([{ $group: { _id: "$brand_slug", count: { $sum: 1 } } }]),
        Vehicle.aggregate([{ $group: { _id: "$brand_slug", count: { $sum: 1 } } }]),
    ]);

    const phoneMap = {};
    phoneCounts.forEach(p => { if (p._id) phoneMap[p._id.toLowerCase()] = p.count; });
    const vehicleMap = {};
    vehicleCounts.forEach(v => { if (v._id) vehicleMap[v._id.toLowerCase()] = v.count; });

    const data = brands.map(b => ({
        ...b,
        type: b.type || 'phone',
        phone_count: phoneMap[b.slug?.toLowerCase()] || 0,
        vehicle_count: vehicleMap[b.slug?.toLowerCase()] || 0,
    }));

    res.status(200).json(new ApiResponse(200, data, "Brands fetched successfully"));
});

// ─── CREATE ──────────────────────────────────────────────────────────────────────

export const createBrand = asyncHandler(async (req, res) => {
    const { name, type, logo, description } = req.body;

    if (!name) {
        return res.status(400).json(new ApiResponse(400, null, "Brand name is required"));
    }

    const slug = slugify(name);

    const existing = await Brand.findOne({ slug });
    if (existing) {
        return res.status(409).json(new ApiResponse(409, null, "A brand with this name already exists"));
    }

    const brand = await Brand.create({
        name,
        slug,
        type: type === 'ev' ? 'ev' : 'phone',
        logo: logo || undefined,
        description: description || undefined,
    });

    res.status(201).json(new ApiResponse(201, brand, "Brand created successfully"));
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────────

export const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, type, logo, description } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
        return res.status(404).json(new ApiResponse(404, null, "Brand not found"));
    }

    if (name && name !== brand.name) {
        const newSlug = slugify(name);
        const clash = await Brand.findOne({ slug: newSlug, _id: { $ne: id } });
        if (clash) {
            return res.status(409).json(new ApiResponse(409, null, "A brand with this name already exists"));
        }
        // Slug is a foreign key on Phone/Vehicle; renaming the display name is safe,
        // but changing the slug would orphan existing products. Keep the slug stable.
        brand.name = name;
    }

    if (type !== undefined) brand.type = type === 'ev' ? 'ev' : 'phone';
    if (logo !== undefined) brand.logo = logo;
    if (description !== undefined) brand.description = description;

    await brand.save();

    res.status(200).json(new ApiResponse(200, brand, "Brand updated successfully"));
});

// ─── DELETE ──────────────────────────────────────────────────────────────────────

export const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
        return res.status(404).json(new ApiResponse(404, null, "Brand not found"));
    }

    // Block deletion while products still reference this brand slug.
    const [phoneInUse, vehicleInUse] = await Promise.all([
        Phone.countDocuments({ brand_slug: brand.slug }),
        Vehicle.countDocuments({ brand_slug: brand.slug }),
    ]);
    const inUse = phoneInUse + vehicleInUse;
    if (inUse > 0) {
        return res.status(409).json(new ApiResponse(409, null,
            `Cannot delete: ${inUse} product(s) still use this brand (${phoneInUse} phone(s), ${vehicleInUse} EV(s)).`));
    }

    await Brand.findByIdAndDelete(id);
    res.status(200).json(new ApiResponse(200, null, "Brand deleted successfully"));
});
