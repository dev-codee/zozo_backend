import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { Earbud } from '../models/Earbud.model.js';
import { EarbudRevision } from '../models/EarbudRevision.model.js';
import { slugify } from '../utils/slugify.js';
import { generateEarbudDataAdmin, generateEarbudSEO } from '../services/ai.service.js';

// ─── CREATE ──────────────────────────────────────────────────────────────────────

export const createEarbud = asyncHandler(async (req, res) => {
    const earbudData = req.body;

    if (!earbudData.name) {
        return res.status(400).json(new ApiResponse(400, null, "Earbud name is required"));
    }

    earbudData.slug = slugify(earbudData.name);

    const existing = await Earbud.findOne({ slug: earbudData.slug });
    if (existing) {
        return res.status(409).json(new ApiResponse(409, null, "An earbud with this name already exists"));
    }

    // Content tracking & defaults
    earbudData.is_published = earbudData.is_published !== undefined ? earbudData.is_published : true;
    if (req.adminUser) {
        earbudData.createdBy = req.adminUser._id;
        earbudData.updatedBy = req.adminUser._id;
        if (req.adminUser.role === 'EDITOR') {
            earbudData.approvalStatus = 'PENDING_REVIEW';
        } else {
            earbudData.approvalStatus = earbudData.approvalStatus || 'APPROVED';
        }
    } else {
        earbudData.approvalStatus = earbudData.approvalStatus || 'APPROVED';
    }

    // Auto-generate image alt text
    if (Array.isArray(earbudData.images)) {
        earbudData.images = earbudData.images.map((img) => ({
            ...img,
            alt_text: img.alt_text || `${earbudData.name} Price in Pakistan - ZOZO`,
        }));
    }

    // Initial price history entry if price is present
    if (earbudData.price_pkr && (!earbudData.price_history || earbudData.price_history.length === 0)) {
        earbudData.price_history = [{
            date: new Date(),
            price_pkr: Number(earbudData.price_pkr),
            source: 'Initial Price'
        }];
    }

    const newEarbud = await Earbud.create(earbudData);

    if (req.adminUser) {
        await EarbudRevision.create({
            earbudId: newEarbud._id,
            changedBy: req.adminUser._id,
            action: 'CREATED',
            snapshot: newEarbud.toObject(),
        });
    }

    res.status(201).json(new ApiResponse(201, newEarbud, "Earbud created successfully"));
});

// ─── LIST ────────────────────────────────────────────────────────────────────────

export const getAllEarbuds = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const brand = req.query.brand || '';
    const approvalStatus = req.query.approvalStatus || '';

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { model_number: { $regex: search, $options: 'i' } },
            { brand_slug: { $regex: search, $options: 'i' } },
        ];
    }
    if (brand) query.brand_slug = brand;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    const earbuds = await Earbud.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('reviewer', 'name');

    const total = await Earbud.countDocuments(query);

    res.status(200).json(new ApiResponse(200, {
        earbuds,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalEarbuds: total,
    }, "Earbuds fetched successfully"));
});

// ─── GET BY ID ─────────────────────────────────────────────────────────────────

export const getEarbudById = asyncHandler(async (req, res) => {
    const earbud = await Earbud.findById(req.params.id)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('reviewer', 'name');

    if (!earbud) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    res.status(200).json(new ApiResponse(200, earbud, "Earbud fetched successfully"));
});

// ─── UPDATE ──────────────────────────────────────────────────────────────────────

export const updateEarbud = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const earbud = await Earbud.findById(id);
    if (!earbud) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    // Slug conflict check if name changed
    if (updateData.name && updateData.name !== earbud.name) {
        const newSlug = slugify(updateData.name);
        const clash = await Earbud.findOne({ slug: newSlug, _id: { $ne: id } });
        if (clash) {
            return res.status(409).json(new ApiResponse(409, null, "Another earbud with this name already exists"));
        }
        updateData.slug = newSlug;
    }

    // Track price changes
    if (updateData.price_pkr && Number(updateData.price_pkr) !== Number(earbud.price_pkr)) {
        const history = earbud.price_history || [];
        history.push({
            date: new Date(),
            price_pkr: Number(updateData.price_pkr),
            source: 'Price Update'
        });
        updateData.price_history = history;
    }

    // Ensure image alt text
    if (Array.isArray(updateData.images)) {
        updateData.images = updateData.images.map((img) => ({
            ...img,
            alt_text: img.alt_text || `${updateData.name || earbud.name} Price in Pakistan - ZOZO`,
        }));
    }

    if (req.adminUser) {
        updateData.updatedBy = req.adminUser._id;
        if (req.adminUser.role === 'EDITOR' && earbud.approvalStatus === 'APPROVED') {
            updateData.approvalStatus = 'PENDING_REVIEW';
        }
    }

    const updated = await Earbud.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (req.adminUser) {
        await EarbudRevision.create({
            earbudId: updated._id,
            changedBy: req.adminUser._id,
            action: 'UPDATED',
            snapshot: updated.toObject(),
        });
    }

    res.status(200).json(new ApiResponse(200, updated, "Earbud updated successfully"));
});

// ─── DELETE ──────────────────────────────────────────────────────────────────────

export const deleteEarbud = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const earbud = await Earbud.findByIdAndDelete(id);
    if (!earbud) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    // Clean up revisions
    await EarbudRevision.deleteMany({ earbudId: id });

    res.status(200).json(new ApiResponse(200, null, "Earbud deleted successfully"));
});

// ─── APPROVE / REJECT ──────────────────────────────────────────────────────────

export const approveEarbud = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const earbud = await Earbud.findById(id);
    if (!earbud) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    earbud.approvalStatus = 'APPROVED';
    earbud.reviewer = req.adminUser._id;
    await earbud.save();

    await EarbudRevision.create({
        earbudId: earbud._id,
        changedBy: req.adminUser._id,
        action: 'APPROVED',
        snapshot: earbud.toObject(),
    });

    res.status(200).json(new ApiResponse(200, earbud, "Earbud approved successfully"));
});

export const rejectEarbud = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { note } = req.body;

    const earbud = await Earbud.findById(id);
    if (!earbud) {
        return res.status(404).json(new ApiResponse(404, null, "Earbud not found"));
    }

    earbud.approvalStatus = 'REJECTED';
    earbud.reviewer = req.adminUser._id;
    await earbud.save();

    await EarbudRevision.create({
        earbudId: earbud._id,
        changedBy: req.adminUser._id,
        action: 'REJECTED',
        note: note || '',
        snapshot: earbud.toObject(),
    });

    res.status(200).json(new ApiResponse(200, earbud, "Earbud marked as rejected"));
});

// ─── CHECK DUPLICATE ───────────────────────────────────────────────────────────

export const checkEarbudDuplicate = asyncHandler(async (req, res) => {
    const { name, excludeId } = req.query;
    if (!name) {
        return res.status(400).json(new ApiResponse(400, null, "Name query param is required"));
    }

    const slug = slugify(name);
    const query = {
        $or: [
            { slug },
            { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } }
        ]
    };

    if (excludeId) {
        query._id = { $ne: excludeId };
    }

    const duplicate = await Earbud.findOne(query).select('name slug brand_slug');
    res.status(200).json(new ApiResponse(200, { exists: !!duplicate, duplicate }));
});

// ─── AI FILL ───────────────────────────────────────────────────────────────────

export const aiFillEarbud = asyncHandler(async (req, res) => {
    const { name, brand_slug } = req.body;
    if (!name) {
        return res.status(400).json(new ApiResponse(400, null, "Earbud name is required for AI generation"));
    }

    const data = await generateEarbudDataAdmin(name, brand_slug);
    if (!data) {
        return res.status(502).json(new ApiResponse(502, null, "Failed to retrieve specs from AI service"));
    }

    res.status(200).json(new ApiResponse(200, data, "AI earbud data generated successfully"));
});

export const aiFillEarbudSEO = asyncHandler(async (req, res) => {
    const earbudData = req.body;
    if (!earbudData || !earbudData.name) {
        return res.status(400).json(new ApiResponse(400, null, "Earbud data with a name is required for SEO generation"));
    }

    const seo = await generateEarbudSEO(earbudData);
    if (!seo) {
        return res.status(502).json(new ApiResponse(502, null, "Failed to generate SEO from AI service"));
    }

    res.status(200).json(new ApiResponse(200, seo, "AI SEO data generated successfully"));
});

// ─── REVISIONS ─────────────────────────────────────────────────────────────────

export const getEarbudRevisions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const revisions = await EarbudRevision.find({ earbudId: id })
        .sort({ createdAt: -1 })
        .populate('changedBy', 'name email role');

    res.status(200).json(new ApiResponse(200, revisions, "Revisions fetched successfully"));
});
