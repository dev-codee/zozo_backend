import mongoose from 'mongoose';

const taxRuleSchema = new mongoose.Schema({
    price_range_usd: {
        min: Number,
        max: Number
    },
    passport_tax_pkr: Number,
    cnic_tax_pkr: Number
}, { timestamps: true });

export const TaxRule = mongoose.model('TaxRule', taxRuleSchema);
