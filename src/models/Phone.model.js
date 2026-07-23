import mongoose from 'mongoose';

// ─── Embedded Sub-schemas ──────────────────────────────────────────────────────

const imageAssetSchema = new mongoose.Schema({
    url: { type: String, required: true },
    cloud_public_id: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
    alt_text: { type: String },
    width: { type: Number },
    height: { type: Number },
}, { _id: false });

const priceEntrySchema = new mongoose.Schema({
    retailer_slug: { type: String, required: true },
    retailer_name: { type: String, required: true },
    variant: { type: String },
    price_pkr: { type: Number, required: true },
    stock_status: { type: String },
    product_url: { type: String },
    last_checked: { type: Date, default: Date.now },
}, { _id: false });

const sourceRefSchema = new mongoose.Schema({
    source_name: { type: String, required: true },
    source_url: { type: String, required: true },
    scraped_at: { type: Date, default: Date.now },
}, { _id: false });

const cameraUnitSchema = new mongoose.Schema({
    megapixels: { type: Number },
    type: { type: String },
    aperture: { type: String },
}, { _id: false });

// ─── Main Phone Schema ────────────────────────────────────────────────────────

const phoneSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand_slug: { type: String, required: true, index: true },
    model_number: { type: String },
    release_date: { type: Date },
    description: { type: String },
    status: {
        type: String,
        enum: ['available', 'upcoming', 'discontinued', 'out_of_stock', 'rumored', 'released'],
        default: 'available',
    },

    series: { type: String },
    category: { type: String },
    subcategory: { type: String },
    country_availability: [String],
    carrier_version: { type: String },
    region_version: { type: String },
    manufacturer: { type: String },
    made_in: { type: String },
    tags: [String],
    video_url: { type: String },
    price_pkr: { type: Number },

    images: [imageAssetSchema],

    specs: {
        display: {
            size_inches: Number,
            resolution: String,
            type: { type: String },
            refresh_rate_hz: Number,
            protection: String,
            peak_brightness_nits: Number,
            features: [String],
        },
        performance: {
            chipset: String,
            cpu: String,
            gpu: String,
            ram_options_gb: [Number],
            storage_options_gb: [Number],
            expandable_storage: Boolean,
        },
        camera: {
            rear: [cameraUnitSchema],
            front: [cameraUnitSchema],
            rear_summary: String,
            front_summary: String,
            video_recording: String,
            video_features: [String],
        },
        battery: {
            capacity_mah: Number,
            charging_watts: Number,
            fast_charging: Boolean,
            wireless_charging: Boolean,
        },
        body: {
            height_mm: Number,
            width_mm: Number,
            thickness_mm: Number,
            weight_g: Number,
            materials: String,
            water_resistance: String,
        },
        connectivity: {
            network: String,
            sim: String,
            usb: String,
            bluetooth: String,
            nfc: Boolean,
            network_features: [String],
            sim_types: [String],
        },
        os: String,
        ai_features: [String],
        extra_specs: mongoose.Schema.Types.Mixed,
    },

    prices: [priceEntrySchema],

    pta_tax: {
        passport_pkr: Number,
        cnic_pkr: Number,
        last_updated: Date,
        source_note: String,
    },

    rating: {
        average: Number,
        count: { type: Number, default: 0 },
    },

    seo: {
        meta_title: String,
        meta_description: String,
    },

    sources: [sourceRefSchema],

    // Content Tracking & Approvals
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    approvalStatus: {
        type: String,
        enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
        default: 'DRAFT'
    },
    importSource: { type: String },
    lastSync: { type: Date },
    syncStatus: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING']
    },

    is_published: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Indexes ───────────────────────────────────────────────────────────────────

phoneSchema.index({ name: 'text' });
phoneSchema.index({ 'prices.price_pkr': 1 });
phoneSchema.index({ brand_slug: 1, 'prices.price_pkr': 1 });
phoneSchema.index({ 'specs.performance.ram_options_gb': 1 });
phoneSchema.index({ 'specs.performance.storage_options_gb': 1 });
phoneSchema.index({ status: 1 });

export const Phone = mongoose.model('Phone', phoneSchema);
