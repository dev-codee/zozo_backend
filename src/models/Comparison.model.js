import mongoose from 'mongoose';

const comparisonSchema = new mongoose.Schema(
    {
        slugs: {
            type: [String],
            required: true,
            index: true,
        },
        phones: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Phone',
            },
        ],
        hits: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

comparisonSchema.index({ slugs: 1 });

const Comparison = mongoose.model('Comparison', comparisonSchema);

export default Comparison;
