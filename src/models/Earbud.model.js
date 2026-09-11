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

const priceHistoryEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    price_pkr: { type: Number },
    source: { type: String },
}, { _id: false });

const sourceRefSchema = new mongoose.Schema({
    source_name: { type: String, required: true },
    source_url: { type: String, required: true },
    scraped_at: { type: Date, default: Date.now },
}, { _id: false });

// ─── Main Earbud Schema ────────────────────────────────────────────────────────

const earbudSchema = new mongoose.Schema({
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

    wearing_type: {
        type: String,
        enum: ['In-Ear', 'Semi-In-Ear / Open-Ear', 'Earhook', 'Over-Ear / Neckband'],
        default: 'In-Ear',
    },
    colors: [String],
    country_availability: [String],
    made_in: { type: String },
    tags: [String],
    video_url: { type: String },
    price_pkr: { type: Number },

    // Append-only log of headline-price changes for price history chart
    price_history: [priceHistoryEntrySchema],

    images: [imageAssetSchema],

    // ─── Technical Specifications ───────────────────────────────────────────────
    specs: {
        // Audio & Acoustic Performance
        audio: {
            driver_type: { type: String }, // e.g. Dynamic Driver, Balanced Armature, Hybrid
            driver_size_mm: { type: Number }, // e.g. 11, 10, 8.4
            frequency_min_hz: { type: Number, default: 20 },
            frequency_max_hz: { type: Number, default: 20000 },
            impedance_ohms: { type: Number }, // e.g. 16, 32
            sensitivity_db: { type: Number }, // e.g. 102
            hi_res_audio: { type: Boolean, default: false }, // Hi-Res Audio Wireless
            spatial_audio: { type: String }, // e.g. "Spatial Audio with Dynamic Head Tracking", "360 Reality Audio"
            sound_features: [String], // e.g. ["Custom Equalizer", "Bass Boost+", "HearID"]
        },

        // Noise Cancellation & Microphones
        noise_cancellation: {
            has_anc: { type: Boolean, default: false },
            anc_depth_db: { type: Number }, // e.g. 48, 50
            anc_type: { type: String }, // e.g. "Adaptive Hybrid ANC", "Hybrid ANC"
            transparency_mode: { type: Boolean, default: false },
            enc_call_noise_reduction: { type: Boolean, default: true },
            mic_count_total: { type: Number }, // e.g. 6
            mic_count_per_earbud: { type: Number }, // e.g. 3
            wind_noise_reduction: { type: Boolean, default: false },
            mic_tech_features: [String], // e.g. ["AI DNN Noise Reduction", "Bone Conduction Sensor", "Beamforming"]
        },

        // Battery & Charging
        battery: {
            earbud_battery_mah: { type: Number }, // per bud e.g. 55
            case_battery_mah: { type: Number }, // e.g. 500
            playtime_earbuds_anc_off_hrs: { type: Number }, // e.g. 8
            playtime_earbuds_anc_on_hrs: { type: Number }, // e.g. 6
            total_playtime_with_case_hrs: { type: Number }, // e.g. 40
            charging_port: { type: String, default: 'USB Type-C' },
            fast_charging: { type: Boolean, default: true },
            fast_charge_summary: { type: String }, // e.g. "10 mins charge = 2 hours playtime"
            earbud_charge_time_mins: { type: Number }, // e.g. 60
            case_charge_time_mins: { type: Number }, // e.g. 120
            wireless_charging: { type: Boolean, default: false },
        },

        // Connectivity & Codecs
        connectivity: {
            bluetooth_version: { type: String, default: '5.3' }, // e.g. "5.4", "5.3"
            bluetooth_range_meters: { type: Number, default: 10 },
            codecs: [String], // e.g. ["SBC", "AAC", "LDAC", "aptX", "LHDC"]
            multipoint_pairing: { type: Boolean, default: false }, // Dual-device connection
            google_fast_pair: { type: Boolean, default: false },
            low_latency_gaming_mode: { type: Boolean, default: false },
            latency_ms: { type: Number }, // e.g. 40, 55, 80
            app_support: { type: String }, // e.g. "Sony Headphones Connect", "Soundcore App"
        },

        // Physical, Comfort & Water Resistance
        physical: {
            water_resistance: { type: String }, // e.g. "IPX4", "IP54", "IP55", "IP68"
            case_water_resistance: { type: String }, // e.g. "IPX4", "None"
            earbud_weight_g: { type: Number }, // e.g. 4.6
            case_weight_g: { type: Number }, // e.g. 41
            total_weight_g: { type: Number }, // e.g. 50
            earbud_dimensions_mm: { type: String },
            case_dimensions_mm: { type: String },
        },

        // Controls & Sensors
        controls: {
            control_type: { type: String, default: 'Touch Controls' }, // "Touch Controls", "Pinch / Force", "Physical Button"
            volume_control: { type: Boolean, default: true },
            in_ear_detection: { type: Boolean, default: true }, // Auto-play/pause
            voice_assistant: [String], // e.g. ["Siri", "Google Assistant", "Alexa"]
            extra_features: [String], // e.g. ["Find My Earbuds", "Case Speaker", "Lanyard Loop"]
        },

        // Package Contents
        in_the_box: [String],

        extra_specs: mongoose.Schema.Types.Mixed,
    },

    prices: [priceEntrySchema],

    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },

    view_count: { type: Number, default: 0, index: true },

    seo: {
        meta_title: String,
        meta_description: String,
        meta_keywords: String,
        focus_keyword: String,
        long_tail_keywords: [String],
        canonical_url: String,
        og_title: String,
        og_description: String,
        og_image: String,
        // AI-Generated SEO Fields
        ai_seo_title: String,
        ai_meta_description: String,
        ai_faq: [{
            question: { type: String },
            answer: { type: String },
            _id: false,
        }],
        ai_summary: String,
        ai_pros: [String],
        ai_cons: [String],
        ai_buying_advice: String,
        ai_snippet: String,
        ai_suggested_tags: [String],
        ai_keywords: [String],
    },

    sources: [sourceRefSchema],

    // Content Tracking & Approvals
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    approvalStatus: {
        type: String,
        enum: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
        default: 'DRAFT',
    },
    importSource: { type: String },
    lastSync: { type: Date },
    syncStatus: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING'],
    },

    is_published: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Indexes ───────────────────────────────────────────────────────────────────

earbudSchema.index({ name: 'text' });
earbudSchema.index({ price_pkr: 1 });
earbudSchema.index({ brand_slug: 1, price_pkr: 1 });
earbudSchema.index({ approvalStatus: 1, price_pkr: 1 });
earbudSchema.index({ 'specs.noise_cancellation.has_anc': 1 });
earbudSchema.index({ status: 1 });
earbudSchema.index({ approvalStatus: 1, brand_slug: 1 });
earbudSchema.index({ tags: 1 });
earbudSchema.index({ updatedAt: -1 });
earbudSchema.index({ release_date: -1 });
earbudSchema.index({ brand_slug: 1, view_count: -1 });
earbudSchema.index({ approvalStatus: 1, view_count: -1 });

export const Earbud = mongoose.model('Earbud', earbudSchema);
