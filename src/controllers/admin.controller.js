import { asyncHandler } from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Phone } from '../models/Phone.model.js';
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

    const newPhone = await Phone.create(phoneData);

    res.status(201).json(new ApiResponse(201, newPhone, "Phone created successfully"));
});

export const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (username === 'superzozoadmin' && password === '2yYN;6£10%') {
        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        res.status(200).json(new ApiResponse(200, { token }, "Login successful"));
    } else {
        res.status(401).json(new ApiResponse(401, null, "Invalid credentials"));
    }
});

export const getAllPhones = asyncHandler(async (req, res) => {
    const phones = await Phone.find({}).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, phones, "Phones fetched successfully"));
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
    
    const phone = await Phone.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!phone) {
        return res.status(404).json(new ApiResponse(404, null, "Phone not found"));
    }
    
    res.status(200).json(new ApiResponse(200, phone, "Phone updated successfully"));
});
