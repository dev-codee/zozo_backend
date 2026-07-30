import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import UserBenchmark from '../models/UserBenchmark.model.js';
import { Phone } from '../models/Phone.model.js';

export const submitBenchmark = asyncHandler(async (req, res) => {
    const {
        phone_slug, // optional, if selected from list
        device_name,
        processor,
        benchmarks, // should be a JSON string from frontend
        user_name,
        android_version,
        memory_config,
        comment
    } = req.body;

    if (!device_name || !processor || !user_name) {
        throw new ApiError(400, "Device Name, Processor, and User Name are required.");
    }

    let parsedBenchmarks = {};
    try {
        parsedBenchmarks = typeof benchmarks === 'string' ? JSON.parse(benchmarks) : benchmarks;
    } catch (e) {
        throw new ApiError(400, "Invalid benchmarks data format.");
    }

    // Check for screenshot
    const screenshotLocalPath = req.file?.path;
    if (!screenshotLocalPath) {
        throw new ApiError(400, "Screenshot evidence is required.");
    }

    // Upload to Cloudinary
    const screenshot = await uploadOnCloudinary(screenshotLocalPath);
    if (!screenshot) {
        throw new ApiError(500, "Failed to upload screenshot evidence.");
    }

    let phoneId = null;
    if (phone_slug) {
        const phone = await Phone.findOne({ slug: phone_slug }).select('_id');
        if (phone) {
            phoneId = phone._id;
        }
    }


    try {
        const newBenchmark = await UserBenchmark.create({
            phone: phoneId,
            device_name,
            processor,
            submitted_by: req.user?._id,
            benchmarks: parsedBenchmarks,
            screenshot_url: screenshot.secure_url,
            user_info: {
                name: user_name,
                android_version,
                memory_config,
                comment
            },
            status: 'pending'
        });

        return res.status(201).json(
            new ApiResponse(201, newBenchmark, "Benchmark submitted successfully and is pending approval.")
        );

    } catch (error) {
        console.error("Error submitting benchmark:", error);
        throw new ApiError(500, "Something went wrong while submitting the benchmark");
    }
});

// Admin Controllers

export const getAdminBenchmarks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
        query.status = req.query.status;
    }

    const total = await UserBenchmark.countDocuments(query);
    const benchmarks = await UserBenchmark.find(query)
        .populate('submitted_by', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return res.status(200).json(
        new ApiResponse(200, {
            benchmarks,
            page,
            totalPages: Math.ceil(total / limit),
            total
        }, "Benchmarks retrieved successfully")
    );
});

export const updateBenchmarkStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const benchmark = await UserBenchmark.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!benchmark) {
        throw new ApiError(404, "Benchmark not found");
    }

    return res.status(200).json(
        new ApiResponse(200, benchmark, `Benchmark status updated to ${status}`)
    );
});
