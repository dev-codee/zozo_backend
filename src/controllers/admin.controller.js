import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Phone } from '../models/Phone.model.js';
import { AdminUser } from '../models/AdminUser.model.js';
import { PhoneRevision } from '../models/PhoneRevision.model.js';
import { AdminActivityLog } from '../models/AdminActivityLog.model.js';
import { slugify } from '../utils/slugify.js';
import jwt from 'jsonwebtoken';
export const getDashboardStats = asyncHandler(async (req, res) => {
    // Calls admin services to gather stats
    const totalPhones = await Phone.countDocuments();
    res.status(200).json(new ApiResponse(200, { totalPhones }, "Dashboard stats fetched"));
});

export const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(new ApiResponse(400, null, "No file uploaded"));
    }

    const uploadResult = await uploadOnCloudinary(req.file.path);

    if (!uploadResult) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to upload image to Cloudinary"));
    }

    res.status(200).json(new ApiResponse(200, {
        url: uploadResult.secure_url,
        cloud_public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height
    }, "Image uploaded successfully"));
});

export const createPhone = asyncHandler(async (req, res) => {
    const phoneData = req.body;

    if (!phoneData.name) {
        return res.status(400).json(new ApiResponse(400, null, "Phone name is required"));
    }

    phoneData.slug = slugify(phoneData.name);

    const existingPhone = await Phone.findOne({ slug: phoneData.slug });
    if (existingPhone) {
        return res.status(409).json(new ApiResponse(409, null, "A phone with this name already exists"));
    }

    // Content tracking
    if (req.adminUser) {
        phoneData.createdBy = req.adminUser._id;
        phoneData.updatedBy = req.adminUser._id;
        // Editors must submit for review; Super Admins/Moderators can auto-approve
        if (req.adminUser.role === 'EDITOR') {
            phoneData.approvalStatus = 'PENDING_REVIEW';
        } else {
            phoneData.approvalStatus = phoneData.approvalStatus || 'APPROVED';
        }
    }

    const newPhone = await Phone.create(phoneData);

    // Create revision (CREATED snapshot)
    if (req.adminUser) {
        await PhoneRevision.create({
            phoneId: newPhone._id,
            changedBy: req.adminUser._id,
            action: 'CREATED',
            snapshot: newPhone.toObject()
        });
        // Paused staff change logs
        /* await AdminActivityLog.create({
            adminId: req.adminUser._id,
            action: 'CREATE_PHONE',
            entityType: 'PHONE',
            entityId: newPhone._id,
            details: newPhone.name,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        }); */
    }

    res.status(201).json(new ApiResponse(201, newPhone, "Phone created successfully"));
});

export const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const admin = await AdminUser.findOne({ username, isActive: true });
    if (!admin) {
        return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign(
        { _id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    // Paused staff change logs
    /* await AdminActivityLog.create({
        adminId: admin._id,
        action: 'LOGIN',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }); */

    res.status(200).json(new ApiResponse(200, {
        token,
        admin: {
            _id: admin._id,
            name: admin.name,
            role: admin.role,
            email: admin.email
        }
    }, "Login successful"));
});

export const getAllPhones = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { model_number: { $regex: search, $options: 'i' } },
            { brand_slug: { $regex: search, $options: 'i' } }
        ];
    }

    const phones = await Phone.find(query).sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .populate('updatedBy', 'name')
        .populate('reviewer', 'name');
        
    const total = await Phone.countDocuments(query);

    res.status(200).json(new ApiResponse(200, {
        phones,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalPhones: total
    }, "Phones fetched successfully"));
});

export const deletePhone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const phone = await Phone.findByIdAndDelete(id);
    
    if (!phone) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }
    
    res.status(200).json(new ApiResponse(200, null, "Phone deleted successfully"));
});
export const getPhoneById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const phone = await Phone.findById(id);
    
    if (!phone) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }
    
    res.status(200).json(new ApiResponse(200, phone, "Phone fetched successfully"));
});

export const updatePhone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    
    if (updateData.name) {
        updateData.slug = slugify(updateData.name);
        const existingPhone = await Phone.findOne({ slug: updateData.slug, _id: { $ne: id } });
        if (existingPhone) {
            return res.status(409).json(new ApiResponse(409, null, "A phone with this name already exists"));
        }
    }

    // Capture previous state for revision history
    const previousPhone = await Phone.findById(id);
    if (!previousPhone) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }

    if (req.adminUser) {
        updateData.updatedBy = req.adminUser._id;
    }
    
    const phone = await Phone.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    // Create revision
    if (req.adminUser) {
        await PhoneRevision.create({
            phoneId: id,
            changedBy: req.adminUser._id,
            action: 'UPDATED',
            snapshot: previousPhone.toObject()
        });
        // Paused staff change logs
        /* await AdminActivityLog.create({
            adminId: req.adminUser._id,
            action: 'UPDATE_PHONE',
            entityType: 'PHONE',
            entityId: id,
            details: phone.name,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        }); */
    }
    
    res.status(200).json(new ApiResponse(200, phone, "Phone updated successfully"));
});

export const aiFillPhone = asyncHandler(async (req, res) => {
    const { phoneName } = req.body;
    if (!phoneName) {
        return res.status(400).json(new ApiResponse(400, null, "Phone name is required"));
    }
    
    const { generatePhoneDataAdmin } = await import('../services/ai.service.js');
    const aiData = await generatePhoneDataAdmin(phoneName);
    
    if (!aiData) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to generate AI data"));
    }
    
    res.status(200).json(new ApiResponse(200, aiData, "AI data generated successfully"));
});

// ─── APPROVAL WORKFLOW ─────────────────────────────────────────────────────────

export const approvePhone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const phone = await Phone.findById(id);
    if (!phone) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }

    phone.approvalStatus = 'APPROVED';
    phone.reviewer = req.adminUser._id;
    await phone.save();

    await PhoneRevision.create({
        phoneId: id,
        changedBy: req.adminUser._id,
        action: 'APPROVED',
        snapshot: phone.toObject(),
        note: req.body.note || ''
    });
    // Paused staff change logs
    /* await AdminActivityLog.create({
        adminId: req.adminUser._id,
        action: 'APPROVE_PHONE',
        entityType: 'PHONE',
        entityId: id,
        details: phone.name,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }); */

    res.status(200).json(new ApiResponse(200, phone, "Phone approved"));
});

export const rejectPhone = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const phone = await Phone.findById(id);
    if (!phone) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }

    phone.approvalStatus = 'REJECTED';
    phone.reviewer = req.adminUser._id;
    await phone.save();

    await PhoneRevision.create({
        phoneId: id,
        changedBy: req.adminUser._id,
        action: 'REJECTED',
        snapshot: phone.toObject(),
        note: req.body.note || ''
    });
    // Paused staff change logs
    /* await AdminActivityLog.create({
        adminId: req.adminUser._id,
        action: 'REJECT_PHONE',
        entityType: 'PHONE',
        entityId: id,
        details: phone.name,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }); */

    res.status(200).json(new ApiResponse(200, phone, "Phone rejected"));
});

// ─── REVISION HISTORY ───────────────────────────────────────────────────────────

export const getPhoneRevisions = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const revisions = await PhoneRevision.find({ phoneId: id })
        .sort({ createdAt: -1 })
        .populate('changedBy', 'name role');
    res.status(200).json(new ApiResponse(200, revisions, "Revisions fetched"));
});

// ─── DUPLICATE CHECKER ──────────────────────────────────────────────────────────

export const checkDuplicate = asyncHandler(async (req, res) => {
    const { name, model_number } = req.query;
    const conditions = [];
    if (name) conditions.push({ name: { $regex: name, $options: 'i' } });
    if (model_number) conditions.push({ model_number: { $regex: model_number, $options: 'i' } });

    if (conditions.length === 0) {
        return res.status(200).json(new ApiResponse(200, [], "No duplicates"));
    }

    const matches = await Phone.find({ $or: conditions }).select('name model_number slug status').limit(10);
    res.status(200).json(new ApiResponse(200, matches, "Duplicate check results"));
});

// ─── TEAM MANAGEMENT ────────────────────────────────────────────────────────────

export const getTeamMembers = asyncHandler(async (req, res) => {
    const members = await AdminUser.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, members, "Team members fetched"));
});

export const createTeamMember = asyncHandler(async (req, res) => {
    const { username, email, password, name, role, permissions } = req.body;

    if (!username || !email || !password || !name) {
        return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }

    const existing = await AdminUser.findOne({ $or: [{ username }, { email }] });
    if (existing) {
        return res.status(409).json(new ApiResponse(409, null, "Username or email already exists"));
    }

    const member = await AdminUser.create({ username, email, password, name, role: role || 'EDITOR', permissions: permissions || [] });

    // Paused staff change logs
    /* await AdminActivityLog.create({
        adminId: req.adminUser._id,
        action: 'CREATE_TEAM_MEMBER',
        entityType: 'TEAM_MEMBER',
        entityId: member._id,
        details: `Created ${role || 'EDITOR'}: ${name}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }); */

    const memberObj = member.toObject();
    delete memberObj.password;
    res.status(201).json(new ApiResponse(201, memberObj, "Team member created"));
});

export const updateTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password update through this endpoint
    delete updates.password;

    const member = await AdminUser.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
    if (!member) {
        return res.status(404).json(new ApiResponse(404, null, "Team member not found"));
    }

    // Paused staff change logs
    /* await AdminActivityLog.create({
        adminId: req.adminUser._id,
        action: 'UPDATE_TEAM_MEMBER',
        entityType: 'TEAM_MEMBER',
        entityId: id,
        details: `Updated: ${member.name}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }); */

    res.status(200).json(new ApiResponse(200, member, "Team member updated"));
});

export const deleteTeamMember = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.adminUser._id.toString() === id) {
        return res.status(400).json(new ApiResponse(400, null, "Cannot delete your own account"));
    }

    const member = await AdminUser.findByIdAndDelete(id);
    if (!member) {
        return res.status(404).json(new ApiResponse(404, null, "Team member not found"));
    }

    // Paused staff change logs
    /* await AdminActivityLog.create({
        adminId: req.adminUser._id,
        action: 'DELETE_TEAM_MEMBER',
        entityType: 'TEAM_MEMBER',
        entityId: id,
        details: `Deleted: ${member.name}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
    }); */

    res.status(200).json(new ApiResponse(200, null, "Team member deleted"));
});

export const getTeamMemberActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AdminActivityLog.find({ adminId: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const total = await AdminActivityLog.countDocuments({ adminId: id });

    res.status(200).json(new ApiResponse(200, {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    }, "Activity fetched"));
});

export const getAdminActivityLogs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AdminActivityLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('adminId', 'name role');
    const total = await AdminActivityLog.countDocuments();

    res.status(200).json(new ApiResponse(200, {
        logs,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    }, "Admin activity fetched"));
});

