import mongoose from 'mongoose';

const adSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ad title is required'],
            trim: true,
        },
        image: {
            type: String,
            required: [true, 'Ad image URL is required'],
        },
        link: {
            type: String,
            required: [true, 'Destination link is required'],
        },
        placement: {
            type: String,
            required: [true, 'Ad placement is required'],
            enum: ['TOP_HEADER', 'SIDEBAR', 'BOTTOM_PAGE', 'PRODUCT_AREA'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        startDate: {
            type: Date,
        },
        endDate: {
            type: Date,
        },
        views: {
            type: Number,
            default: 0,
        },
        clicks: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('Ad', adSchema);
