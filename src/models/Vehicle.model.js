import mongoose from 'mongoose';

// ─── Embedded Sub-schemas ──────────────────────────────────────────────────────
// Shared shape with Phone.model.js so admin image upload / price / source
// tooling can be reused across verticals.

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

const priceHistoryEntrySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    price_pkr: { type: Number },
    source: { type: String },
}, { _id: false });

// ─── Main Vehicle (EV) Schema ───────────────────────────────────────────────────
// One document per variant/trim (e.g. "BYD Seal Performance AWD" is its own doc,
// separate from "BYD Seal RWD"). Variants are grouped on the frontend by
// `model_name` + `brand_slug`. Field structure follows EV_SPECIFICATION_FIELDS.md.

const vehicleSchema = new mongoose.Schema({
    // ── Category 1: Identity & Classification ──────────────────────────────────
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brand_slug: { type: String, required: true, index: true },
    model_name: { type: String, index: true },
    variant_name: { type: String },
    model_year: { type: Number },
    generation: { type: String },
    vehicle_type: {
        type: String,
        enum: ['BEV', 'PHEV', 'EREV', 'FCEV'],
        default: 'BEV',
    },
    // Broad top-level category so "bike / car / cycle" style filtering is possible
    // alongside the finer automotive body_type.
    ev_category: {
        type: String,
        enum: ['Car', 'Bike', 'Scooter', 'Cycle', 'Rickshaw', 'Truck', 'Van', 'Bus', 'Other'],
        default: 'Car',
        index: true,
    },
    body_type: {
        type: String,
        enum: ['Sedan', 'SUV', 'Crossover', 'Hatchback', 'Coupe', 'MPV', 'Pickup', 'Sports', 'Wagon', 'Scooter', 'Bike', 'Rickshaw', 'Other'],
    },
    segment: { type: String },
    platform: { type: String },
    doors: { type: Number },
    seats: { type: Number },
    status: {
        type: String,
        enum: ['available', 'upcoming', 'announced', 'rumored', 'discontinued'],
        default: 'available',
    },
    announcement_date: { type: Date },
    release_date: { type: Date },
    assembly_country: { type: String },
    made_in: { type: String },
    description: { type: String },
    tags: [String],
    country_availability: [String],
    video_url: { type: String },
    price_pkr: { type: Number },

    images: [imageAssetSchema],

    specs: {
        // ── Category 2: Battery & Energy Storage ───────────────────────────────
        battery: {
            chemistry: String,
            capacity_gross_kwh: Number,
            capacity_usable_kwh: Number,
            system_voltage: Number,
            thermal_management: String,
            warranty_years: Number,
            warranty_distance_km: Number,
        },
        // ── Category 3: Range & Efficiency ─────────────────────────────────────
        range_and_efficiency: {
            wltp_combined_km: Number,
            wltp_consumption_kwh_100km: Number,
            epa_combined_km: Number,
            efficiency_mpge_combined: Number,
            cltc_range_km: Number,
            real_world_range_mild_km: Number,
            real_world_range_cold_km: Number,
            real_world_range_highway_km: Number,
            drag_coefficient_cd: Number,
        },
        // ── Category 4: Charging & Bidirectional Power ─────────────────────────
        charging: {
            ac_max_power_kw: Number,
            ac_port_type: String,
            ac_charge_time_0_100_hrs: Number,
            dc_max_power_kw: Number,
            dc_port_type: String,
            dc_charge_time_10_80_min: Number,
            v2l_support: Boolean,
            v2h_support: Boolean,
            v2g_support: Boolean,
        },
        // ── Category 5: Drivetrain, Motors & Performance ───────────────────────
        powertrain: {
            drive_layout: String,
            motor_count: Number,
            total_power_hp: Number,
            total_power_kw: Number,
            total_torque_nm: Number,
            acceleration_0_100_kmh: Number,
            acceleration_0_60_mph: Number,
            top_speed_kmh: Number,
        },
        // ── Category 6: Dimensions, Weight & Storage ───────────────────────────
        dimensions_and_weight: {
            length_mm: Number,
            width_mm: Number,
            height_mm: Number,
            wheelbase_mm: Number,
            ground_clearance_mm: Number,
            curb_weight_kg: Number,
            trunk_liters: Number,
            frunk_liters: Number,
            towing_braked_kg: Number,
            towing_unbraked_kg: Number,
        },
        // ── Category 7: Chassis, Suspension, Brakes & Wheels ───────────────────
        chassis_and_suspension: {
            front_suspension: String,
            rear_suspension: String,
            air_suspension: Boolean,
            turning_circle_m: Number,
            wheel_sizes_inches: [Number],
            tire_size: String,
        },
        // ── Category 8: Cockpit, Infotainment & Smart Features ─────────────────
        cockpit_and_tech: {
            cockpit_os: String,
            cockpit_chip: String,
            center_screen_inches: Number,
            center_screen_features: String,
            driver_cluster_inches: Number,
            hud: String,
            apple_carplay: String,
            android_auto: String,
            audio_brand: String,
            speaker_count: Number,
            wireless_chargers: Number,
            ota_updates: String,
            heat_pump: Boolean,
        },
        // ── Category 9: ADAS, Sensors, Autonomy & Safety ───────────────────────
        adas_and_safety: {
            euro_ncap_stars: Number,
            nhtsa_stars: Number,
            airbag_count: Number,
            autonomy_level: String,
            adas_system_name: String,
            lidar_count: Number,
            camera_count: Number,
            radar_count: Number,
            ultrasonic_count: Number,
            features: [String],
        },
        extra_specs: mongoose.Schema.Types.Mixed,
    },

    // ── Category 10: Pricing, Taxation & Local Market ──────────────────────────
    pricing: {
        price_global_base_usd: Number,
        price_global_base_cny: Number,
        price_global_base_eur: Number,
        price_pkr_ex_factory: Number,
        price_pkr_on_road: Number,
        price_history: [priceHistoryEntrySchema],
    },

    prices: [priceEntrySchema],

    // ── Category 11: Zozo Ratings & Editorial ──────────────────────────────────
    ratings: {
        overall: Number,
        range_efficiency: Number,
        charging_speed: Number,
        performance: Number,
        tech_cockpit: Number,
        safety_adas: Number,
        value_for_money: Number,
    },

    rating: {
        average: Number,
        count: { type: Number, default: 0 },
    },

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
        ai_seo_title: String,
        ai_meta_description: String,
        ai_faq: [{
            question: { type: String },
            answer: { type: String },
            _id: false,
        }],
        ai_summary: String,
        ai_editorial_summary: String,
        ai_pros: [String],
        ai_cons: [String],
        ai_buying_advice: String,
        ai_snippet: String,
        ai_suggested_tags: [String],
        ai_keywords: [String],
    },

    competitor_slugs: [String],

    sources: [sourceRefSchema],

    // ── Content Tracking & Approvals ───────────────────────────────────────────
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

// ─── Indexes ────────────────────────────────────────────────────────────────────

vehicleSchema.index({ name: 'text' });
vehicleSchema.index({ brand_slug: 1, model_name: 1 });
vehicleSchema.index({ ev_category: 1, body_type: 1 });
vehicleSchema.index({ price_pkr: 1 });
vehicleSchema.index({ 'specs.battery.capacity_usable_kwh': 1 });
vehicleSchema.index({ 'specs.range_and_efficiency.wltp_combined_km': 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ approvalStatus: 1, brand_slug: 1 });
vehicleSchema.index({ tags: 1 });
vehicleSchema.index({ release_date: -1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
