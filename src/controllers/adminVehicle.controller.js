import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Vehicle } from '../models/Vehicle.model.js';
import { VehicleRevision } from '../models/VehicleRevision.model.js';
import { slugify } from '../utils/slugify.js';
import { generateVehicleDataAdmin, generateVehicleSEO } from '../services/ai.service.js';

// ─── CREATE ──────────────────────────────────────────────────────────────────────

export const createVehicle = asyncHandler(async (req, res) => {
    const vehicleData = req.body;

    if (!vehicleData.name) {
        return res.status(400).json(new ApiResponse(400, null, "Vehicle name is required"));
    }

    vehicleData.slug = slugify(vehicleData.name);

    const existing = await Vehicle.findOne({ slug: vehicleData.slug });
    if (existing) {
        return res.status(409).json(new ApiResponse(409, null, "A vehicle with this name already exists"));
    }

    // Content tracking & defaults
    vehicleData.is_published = vehicleData.is_published !== undefined ? vehicleData.is_published : true;
    if (req.adminUser) {
        vehicleData.createdBy = req.adminUser._id;
        vehicleData.updatedBy = req.adminUser._id;
        // Editors must submit for review; Super Admins/Moderators can auto-approve
        if (req.adminUser.role === 'EDITOR') {
            vehicleData.approvalStatus = 'PENDING_REVIEW';
        } else {
            vehicleData.approvalStatus = vehicleData.approvalStatus || 'APPROVED';
        }
    } else {
        vehicleData.approvalStatus = vehicleData.approvalStatus || 'APPROVED';
    }

    // Auto-generate image alt text
    if (Array.isArray(vehicleData.images)) {
        vehicleData.images = vehicleData.images.map((img) => ({
            ...img,
            alt_text: img.alt_text || `${vehicleData.name} Price in Pakistan - ZOZO`,
        }));
    }

    const newVehicle = await Vehicle.create(vehicleData);

    if (req.adminUser) {
        await VehicleRevision.create({
            vehicleId: newVehicle._id,
            changedBy: req.adminUser._id,
            action: 'CREATED',
            snapshot: newVehicle.toObject(),
        });
    }

    res.status(201).json(new ApiResponse(201, newVehicle, "Vehicle created successfully"));
});

// ─── LIST ────────────────────────────────────────────────────────────────────────

export const getAllVehicles = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { model_name: { $regex: search, $options: 'i' } },
            { brand_slug: { $regex: search, $options: 'i' } },
        ];
    }
    if (category) query.ev_category = category;

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('reviewer', 'name');

    const total = await Vehicle.countDocuments(query);

    res.status(200).json(new ApiResponse(200, {
        vehicles,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalVehicles: total,
    }, "Vehicles fetched successfully"));
});

// ─── GET BY ID ─────────────────────────────────────────────────────────────────

export const getVehicleById = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }
    res.status(200).json(new ApiResponse(200, vehicle, "Vehicle fetched successfully"));
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────────

export const updateVehicle = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.name) {
        updateData.slug = slugify(updateData.name);
        const existing = await Vehicle.findOne({ slug: updateData.slug, _id: { $ne: id } });
        if (existing) {
            return res.status(409).json(new ApiResponse(409, null, "A vehicle with this name already exists"));
        }
    }

    const previousVehicle = await Vehicle.findById(id);
    if (!previousVehicle) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }

    if (req.adminUser) {
        updateData.updatedBy = req.adminUser._id;
    }

    if (Array.isArray(updateData.images)) {
        const vehicleName = updateData.name || previousVehicle.name;
        updateData.images = updateData.images.map((img) => ({
            ...img,
            alt_text: img.alt_text || `${vehicleName} Price in Pakistan - ZOZO`,
        }));
    }

    const vehicle = await Vehicle.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (req.adminUser) {
        await VehicleRevision.create({
            vehicleId: id,
            changedBy: req.adminUser._id,
            action: 'UPDATED',
            snapshot: previousVehicle.toObject(),
        });
    }

    res.status(200).json(new ApiResponse(200, vehicle, "Vehicle updated successfully"));
});

// ─── DELETE ──────────────────────────────────────────────────────────────────────

export const deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }
    res.status(200).json(new ApiResponse(200, null, "Vehicle deleted successfully"));
});

// ─── AI FILL ──────────────────────────────────────────────────────────────────────

export const aiFillVehicle = asyncHandler(async (req, res) => {
    const { vehicleName } = req.body;
    if (!vehicleName) {
        return res.status(400).json(new ApiResponse(400, null, "Vehicle name is required"));
    }

    const aiData = await generateVehicleDataAdmin(vehicleName);
    if (!aiData) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to generate AI vehicle data"));
    }

    res.status(200).json(new ApiResponse(200, aiData, "AI vehicle data generated successfully"));
});

export const aiFillVehicleSEO = asyncHandler(async (req, res) => {
    const { vehicleName, brand_slug, price_pkr, specs } = req.body;
    if (!vehicleName) {
        return res.status(400).json(new ApiResponse(400, null, "vehicleName is required"));
    }

    const aiSEOData = await generateVehicleSEO({ name: vehicleName, brand_slug, price_pkr, specs });
    if (!aiSEOData) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to generate AI SEO data. Ensure AI API key is set."));
    }

    res.status(200).json(new ApiResponse(200, aiSEOData, "AI SEO generated successfully"));
});

// ─── APPROVAL WORKFLOW ─────────────────────────────────────────────────────────

export const approveVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }

    vehicle.approvalStatus = 'APPROVED';
    vehicle.reviewer = req.adminUser._id;
    await vehicle.save();

    await VehicleRevision.create({
        vehicleId: vehicle._id,
        changedBy: req.adminUser._id,
        action: 'APPROVED',
        snapshot: vehicle.toObject(),
        note: req.body.note || '',
    });

    res.status(200).json(new ApiResponse(200, vehicle, "Vehicle approved"));
});

export const rejectVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
        return res.status(404).json(new ApiResponse(404, null, "Vehicle not found"));
    }

    vehicle.approvalStatus = 'REJECTED';
    vehicle.reviewer = req.adminUser._id;
    await vehicle.save();

    await VehicleRevision.create({
        vehicleId: vehicle._id,
        changedBy: req.adminUser._id,
        action: 'REJECTED',
        snapshot: vehicle.toObject(),
        note: req.body.note || '',
    });

    res.status(200).json(new ApiResponse(200, vehicle, "Vehicle rejected"));
});

// ─── REVISION HISTORY ───────────────────────────────────────────────────────────

export const getVehicleRevisions = asyncHandler(async (req, res) => {
    const revisions = await VehicleRevision.find({ vehicleId: req.params.id })
        .sort({ createdAt: -1 })
        .populate('changedBy', 'name role');
    res.status(200).json(new ApiResponse(200, revisions, "Revisions fetched"));
});

// ─── DUPLICATE CHECKER ──────────────────────────────────────────────────────────

export const checkVehicleDuplicate = asyncHandler(async (req, res) => {
    const { name, model_name } = req.query;
    const conditions = [];
    if (name) conditions.push({ name: { $regex: name, $options: 'i' } });
    if (model_name) conditions.push({ model_name: { $regex: model_name, $options: 'i' } });

    if (conditions.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No duplicates"));
    }

    const matches = await Vehicle.find({ $or: conditions })
        .select('name model_name variant_name slug status')
        .limit(10);
    res.status(200).json(new ApiResponse(200, matches, "Duplicate check results"));
});
