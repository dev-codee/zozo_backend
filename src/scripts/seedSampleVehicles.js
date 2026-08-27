import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Vehicle } from '../models/Vehicle.model.js';
import { slugify } from '../utils/slugify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sampleVehicles = [
  {
    name: "BYD Seal Performance AWD",
    slug: "byd-seal-performance-awd",
    brand_slug: "byd",
    model_name: "Seal",
    variant_name: "Performance AWD",
    model_year: 2025,
    generation: "1st Gen",
    vehicle_type: "BEV",
    ev_category: "Car",
    body_type: "Sedan",
    segment: "D-Segment",
    platform: "e-Platform 3.0",
    doors: 4,
    seats: 5,
    status: "available",
    release_date: new Date("2024-08-15"),
    assembly_country: "CBU Import",
    made_in: "China",
    price_pkr: 16990000,
    pricing: {
      price_global_base_usd: 48000,
      price_pkr_ex_factory: 16990000,
      price_pkr_on_road: 17850000,
    },
    images: [
      {
        url: "https://res.cloudinary.com/ptfxdn8x/image/upload/v1724750000/byd_seal_front.png",
        is_primary: true,
        alt_text: "BYD Seal Performance AWD Front View - ZOZO",
      },
    ],
    specs: {
      battery: {
        chemistry: "Blade LFP (Lithium Iron Phosphate)",
        capacity_gross_kwh: 82.5,
        capacity_usable_kwh: 82.5,
        system_voltage: 550,
        thermal_management: "Direct Heat Pump & Liquid Cooling",
        warranty_years: 8,
        warranty_distance_km: 160000,
      },
      range_and_efficiency: {
        wltp_combined_km: 520,
        wltp_consumption_kwh_100km: 18.2,
        cltc_range_km: 650,
        drag_coefficient_cd: 0.219,
      },
      charging: {
        dc_max_power_kw: 150,
        dc_port_type: "CCS2 / GB-T",
        dc_charge_time_10_80_min: 26,
        ac_max_power_kw: 11,
        ac_port_type: "Type 2",
        ac_charge_time_0_100_hrs: 8.5,
        v2l_support: true,
      },
      powertrain: {
        drive_layout: "AWD (Dual Motor)",
        motor_count: 2,
        total_power_hp: 523,
        total_power_kw: 390,
        total_torque_nm: 670,
        acceleration_0_100_kmh: 3.8,
        top_speed_kmh: 220,
      },
      dimensions_and_weight: {
        length_mm: 4800,
        width_mm: 1875,
        height_mm: 1460,
        wheelbase_mm: 2920,
        ground_clearance_mm: 120,
        curb_weight_kg: 2185,
        trunk_liters: 400,
        frunk_liters: 53,
      },
      chassis_and_suspension: {
        front_suspension: "Double Wishbone",
        rear_suspension: "Multi-link Independent (Five-link)",
        air_suspension: false,
        turning_circle_m: 11.4,
        wheel_sizes_inches: [19],
        tire_size: "235/45 R19",
      },
      cockpit_and_tech: {
        cockpit_os: "BYD DiLink 5.0 (4G/5G)",
        cockpit_chip: "Qualcomm Snapdragon 8155",
        center_screen_inches: 15.6,
        center_screen_features: "Electrically Rotating 15.6-inch Touchscreen",
        driver_cluster_inches: 10.25,
        hud: "Head-up Display (W-HUD)",
        apple_carplay: "Wireless & Wired",
        android_auto: "Wireless & Wired",
        audio_brand: "Dynaudio Premium Sound",
        speaker_count: 12,
        wireless_chargers: 2,
        ota_updates: "Supported",
        heat_pump: true,
      },
      adas_and_safety: {
        euro_ncap_stars: 5,
        airbag_count: 9,
        autonomy_level: "Level 2+ (DiPilot)",
        adas_system_name: "BYD DiPilot ADAS Suite",
        camera_count: 5,
        radar_count: 6,
        ultrasonic_count: 12,
        features: [
          "Adaptive Cruise Control (ACC)",
          "Automatic Emergency Braking (AEB)",
          "Lane Departure Warning (LDW)",
          "Blind Spot Detection (BSD)",
          "360-degree Panoramic Camera",
        ],
      },
    },
    ratings: {
      overall: 9.2,
      range_efficiency: 8.8,
      charging_speed: 8.5,
      performance: 9.6,
      tech_cockpit: 9.4,
      safety_adas: 9.5,
      value_for_money: 9.0,
    },
    rating: {
      average: 4.8,
      count: 24,
    },
    description: `The **BYD Seal Performance AWD** is an all-electric sports sedan engineered with BYD's revolutionary **Blade Battery** and **Cell-to-Body (CTB)** technology. Delivering a blistering 0-100 km/h acceleration in just **3.8 seconds** with 523 horsepower, the Seal is one of the quickest and most technologically advanced electric sedans available in Pakistan.

Equipped with an 82.5 kWh battery, it offers an impressive WLTP driving range of up to 520 km on a single charge. Its high-efficiency heat pump and 150 kW DC ultra-fast charging allow replenishing 10% to 80% battery in approximately 26 minutes.

Inside, the cabin features a lavish minimalist design with a rotating 15.6-inch touchscreen, Dynaudio 12-speaker surround sound, and dual 50W wireless chargers.`,
    seo: {
      meta_title: "BYD Seal Performance AWD Price in Pakistan, Specs & Range",
      meta_description: "Discover BYD Seal Performance AWD official price in Pakistan, 82.5 kWh Blade battery specs, 520 km range, 3.8s 0-100 acceleration, and features on ZOZO.",
      ai_pros: [
        "Phenomenal 3.8-second 0-100 km/h acceleration with 523 HP",
        "Ultra-safe BYD Blade LFP Battery with 8-year warranty",
        "Premium interior with Dynaudio 12-speaker sound and rotating display",
        "Fast 150 kW DC charging (10-80% in 26 minutes)",
        "5-Star Euro NCAP safety rating",
      ],
      ai_cons: [
        "Ground clearance of 120 mm requires caution over high speed bumps",
        "Boot opening aperture is relatively narrow",
      ],
      ai_buying_advice: "If you are looking for an executive sports sedan that rivals European performance cars at a fraction of their fuel and maintenance costs, the BYD Seal Performance AWD is arguably the best EV in Pakistan today.",
      ai_faq: [
        {
          question: "What is the official price of BYD Seal Performance in Pakistan?",
          answer: "The BYD Seal Performance AWD is priced at approximately PKR 16,990,000 (ex-factory).",
        },
        {
          question: "What is the real-world driving range of the BYD Seal?",
          answer: "In typical Pakistani mixed driving conditions with air conditioning on, expect a real-world range of 460 to 500 km per full charge.",
        },
      ],
    },
    prices: [
      {
        retailer_name: "Mega Motor Co. (BYD Pakistan)",
        retailer_slug: "byd-pakistan",
        variant: "Performance AWD",
        price_pkr: 16990000,
        stock_status: "Bookings Open",
        product_url: "https://byd.com.pk",
      },
    ],
    approvalStatus: "APPROVED",
    is_published: true,
  },
  {
    name: "Deepal S07 Electric SUV",
    slug: "deepal-s07-electric-suv",
    brand_slug: "deepal",
    model_name: "S07",
    variant_name: "Standard Range",
    model_year: 2025,
    vehicle_type: "BEV",
    ev_category: "Car",
    body_type: "SUV",
    doors: 5,
    seats: 5,
    status: "available",
    release_date: new Date("2024-09-01"),
    assembly_country: "CBU Import",
    made_in: "China",
    price_pkr: 14999000,
    pricing: {
      price_global_base_usd: 42000,
      price_pkr_ex_factory: 14999000,
    },
    images: [
      {
        url: "https://res.cloudinary.com/ptfxdn8x/image/upload/v1724750001/deepal_s07_front.png",
        is_primary: true,
        alt_text: "Deepal S07 Electric SUV Front View - ZOZO",
      },
    ],
    specs: {
      battery: {
        chemistry: "CATL Ternary Lithium (NMC)",
        capacity_usable_kwh: 66.8,
        thermal_management: "Liquid Cooled with Heat Pump",
        warranty_years: 8,
      },
      range_and_efficiency: {
        wltp_combined_km: 475,
        cltc_range_km: 530,
      },
      charging: {
        dc_max_power_kw: 120,
        dc_charge_time_10_80_min: 35,
        ac_max_power_kw: 7,
        v2l_support: true,
      },
      powertrain: {
        drive_layout: "RWD (Rear-Wheel Drive)",
        motor_count: 1,
        total_power_hp: 215,
        total_torque_nm: 320,
        acceleration_0_100_kmh: 7.5,
        top_speed_kmh: 180,
      },
      dimensions_and_weight: {
        length_mm: 4750,
        width_mm: 1930,
        height_mm: 1625,
        wheelbase_mm: 2900,
        ground_clearance_mm: 165,
        trunk_liters: 445,
        frunk_liters: 125,
      },
      cockpit_and_tech: {
        cockpit_os: "Deepal OS (Qualcomm 8155)",
        center_screen_inches: 15.6,
        hud: "Augmented Reality HUD (AR-HUD)",
        wireless_chargers: 1,
        heat_pump: true,
      },
      adas_and_safety: {
        airbag_count: 6,
        autonomy_level: "Level 2 ADAS",
        features: ["Adaptive Cruise Control", "Lane Keep Assist", "AEB"],
      },
    },
    ratings: {
      overall: 8.9,
      performance: 8.0,
      range_efficiency: 8.5,
      charging_speed: 8.0,
      tech_cockpit: 9.2,
      safety_adas: 8.8,
      value_for_money: 9.0,
    },
    rating: {
      average: 4.6,
      count: 15,
    },
    description: "The **Deepal S07** is a premium all-electric SUV brought to Pakistan by Master Changan Motors. Combining futuristic cyberpunk aesthetics with a spacious interior and AR-HUD, it offers exceptional ride quality.",
    seo: {
      meta_title: "Deepal S07 Price in Pakistan, Range & Specs",
      meta_description: "Check Deepal S07 Electric SUV price in Pakistan, 475 km range, 66.8 kWh CATL battery, features and specifications on ZOZO.",
      ai_pros: ["Futuristic styling with frameless doors", "Huge 125-liter front trunk (frunk)", "AR-HUD heads-up display as standard"],
      ai_cons: ["No traditional driver cluster instrument (relying on HUD)"],
    },
    approvalStatus: "APPROVED",
    is_published: true,
  },
  {
    name: "Yadea T5 Electric Bike",
    slug: "yadea-t5-electric-bike",
    brand_slug: "yadea",
    model_name: "T5",
    variant_name: "Graphene Battery Edition",
    model_year: 2025,
    vehicle_type: "BEV",
    ev_category: "Bike",
    body_type: "Scooter",
    seats: 2,
    status: "available",
    price_pkr: 245000,
    pricing: {
      price_pkr_ex_factory: 245000,
    },
    images: [
      {
        url: "https://res.cloudinary.com/ptfxdn8x/image/upload/v1724750002/yadea_t5_scooter.png",
        is_primary: true,
        alt_text: "Yadea T5 Electric Scooter in Pakistan - ZOZO",
      },
    ],
    specs: {
      battery: {
        chemistry: "TTFAR Graphene Battery (3rd Gen)",
        capacity_gross_kwh: 2.6,
        system_voltage: 72,
        warranty_years: 1,
      },
      range_and_efficiency: {
        cltc_range_km: 105,
      },
      charging: {
        ac_charge_time_0_100_hrs: 6,
        ac_port_type: "Standard 220V Home Plug",
      },
      powertrain: {
        drive_layout: "Hub Motor (Rear)",
        motor_count: 1,
        total_power_kw: 2.4,
        total_power_hp: 3.2,
        top_speed_kmh: 55,
      },
      dimensions_and_weight: {
        length_mm: 1890,
        width_mm: 680,
        height_mm: 1110,
        curb_weight_kg: 95,
        ground_clearance_mm: 150,
      },
      cockpit_and_tech: {
        center_screen_features: "Digital Color LED Instrument Display",
      },
      adas_and_safety: {
        features: ["Front Disc Brake", "LED Lighting System", "Regenerative Braking"],
      },
    },
    ratings: {
      overall: 8.7,
      value_for_money: 9.5,
      range_efficiency: 8.8,
    },
    rating: {
      average: 4.5,
      count: 38,
    },
    description: "The **Yadea T5** is Pakistan's leading smart electric scooter powered by 72V 38Ah TTFAR 3rd Generation Graphene Batteries. It delivers up to 105 km on a single charge for negligible daily electricity cost.",
    seo: {
      meta_title: "Yadea T5 Electric Bike Price in Pakistan & Specs",
      meta_description: "Yadea T5 electric bike and scooter price in Pakistan, 105 km range, 72V graphene battery, top speed, and features on ZOZO.",
      ai_pros: ["Ultra-low running cost (under Rs. 1 per km)", "Durable Graphene battery with long cycle life", "Smooth silent ride with regenerative braking"],
      ai_cons: ["Top speed capped at 55 km/h"],
    },
    approvalStatus: "APPROVED",
    is_published: true,
  },
  {
    name: "Evee S1 Air",
    slug: "evee-s1-air",
    brand_slug: "evee",
    model_name: "S1",
    variant_name: "S1 Air (Graphene)",
    model_year: 2025,
    vehicle_type: "BEV",
    ev_category: "Scooter",
    body_type: "Scooter",
    seats: 2,
    status: "available",
    price_pkr: 300000,
    pricing: {
      price_pkr_ex_factory: 300000,
    },
    images: [
      {
        url: "https://res.cloudinary.com/ptfxdn8x/image/upload/v1724750003/evee_s1_air.png",
        is_primary: true,
        alt_text: "Evee S1 Air Electric Scooter in Pakistan - ZOZO",
      },
    ],
    specs: {
      battery: {
        chemistry: "72V 30Ah Graphene Battery",
        capacity_gross_kwh: 2.2,
        system_voltage: 72,
        warranty_years: 1,
      },
      range_and_efficiency: {
        wltp_combined_km: 120,
        cltc_range_km: 120,
      },
      charging: {
        ac_charge_time_0_100_hrs: 6,
        ac_port_type: "Standard Home AC Plug",
      },
      powertrain: {
        drive_layout: "Hub Motor (Rear)",
        motor_count: 1,
        total_power_kw: 2.0,
        total_power_hp: 2.7,
        top_speed_kmh: 70,
      },
      dimensions_and_weight: {
        length_mm: 1850,
        width_mm: 690,
        height_mm: 1120,
        curb_weight_kg: 92,
        ground_clearance_mm: 155,
      },
      cockpit_and_tech: {
        center_screen_features: "Color Digital Display with Anti-glare",
      },
      adas_and_safety: {
        features: ["Front & Rear Disc Brakes", "Daytime Running Lights (DRL)", "Tubeless Tires"],
      },
    },
    ratings: {
      overall: 8.8,
      value_for_money: 9.6,
      range_efficiency: 9.0,
    },
    rating: {
      average: 4.7,
      count: 19,
    },
    description: "The **Evee S1 Air** is an advanced smart electric scooter designed for urban Pakistani commuting. Equipped with 72V 30Ah Graphene battery technology, it delivers an extended range of up to 120 km and top speed of 70 km/h.",
    seo: {
      meta_title: "Evee S1 Air Price in Pakistan, Range & Specs",
      meta_description: "Evee S1 Air electric scooter official price in Pakistan, 120 km range, 72V graphene battery, top speed, and features on ZOZO.",
      ai_pros: ["120 km long range on a single charge", "Modern sporty aerodynamic styling", "High top speed of 70 km/h"],
      ai_cons: ["Charging takes around 6 hours on standard plug"],
    },
    approvalStatus: "APPROVED",
    is_published: true,
  },
  {
    name: "BYD Atto 2",
    slug: "byd-atto-2",
    brand_slug: "byd",
    model_name: "Atto 2",
    variant_name: "Boost",
    model_year: 2025,
    vehicle_type: "BEV",
    ev_category: "Car",
    body_type: "Crossover",
    doors: 5,
    seats: 5,
    status: "available",
    price_pkr: 8900000,
    pricing: {
      price_global_base_usd: 25000,
      price_pkr_ex_factory: 8900000,
    },
    images: [
      {
        url: "https://res.cloudinary.com/ptfxdn8x/image/upload/v1724750004/byd_atto_2.png",
        is_primary: true,
        alt_text: "BYD Atto 2 Electric Crossover in Pakistan - ZOZO",
      },
    ],
    specs: {
      battery: {
        chemistry: "Blade LFP Battery",
        capacity_gross_kwh: 45.1,
        capacity_usable_kwh: 45.1,
        thermal_management: "Liquid Cooling with Heat Pump",
        warranty_years: 8,
      },
      range_and_efficiency: {
        wltp_combined_km: 310,
        cltc_range_km: 401,
      },
      charging: {
        dc_max_power_kw: 65,
        dc_charge_time_10_80_min: 29,
        ac_max_power_kw: 7,
        v2l_support: true,
      },
      powertrain: {
        drive_layout: "FWD (Front-Wheel Drive)",
        motor_count: 1,
        total_power_hp: 174,
        total_torque_nm: 290,
        acceleration_0_100_kmh: 7.9,
        top_speed_kmh: 160,
      },
      dimensions_and_weight: {
        length_mm: 4310,
        width_mm: 1830,
        height_mm: 1675,
        wheelbase_mm: 2620,
        ground_clearance_mm: 170,
        trunk_liters: 345,
      },
      cockpit_and_tech: {
        cockpit_os: "DiLink 4.0",
        center_screen_inches: 12.8,
        center_screen_features: "Rotating Touchscreen",
        wireless_chargers: 1,
        heat_pump: true,
      },
      adas_and_safety: {
        euro_ncap_stars: 5,
        airbag_count: 6,
        features: ["Adaptive Cruise Control", "Lane Keeping Assist", "Automatic Emergency Braking"],
      },
    },
    ratings: {
      overall: 9.0,
      value_for_money: 9.2,
      range_efficiency: 8.7,
      performance: 8.3,
    },
    rating: {
      average: 4.7,
      count: 11,
    },
    description: "The **BYD Atto 2** (also known as the Yuan Up) is a compact all-electric crossover offering urban versatility, cutting-edge Blade Battery safety, and modern interior tech.",
    seo: {
      meta_title: "BYD Atto 2 Price in Pakistan, Range & Specs",
      meta_description: "Check BYD Atto 2 electric crossover price in Pakistan, 45.1 kWh Blade battery, 310 km WLTP range, and specs on ZOZO.",
      ai_pros: ["Affordable entry into BYD Blade Battery tech", "Spacious compact SUV ride height with 170mm clearance", "Efficient heat pump standard"],
      ai_cons: ["DC charging rate capped at 65 kW"],
    },
    approvalStatus: "APPROVED",
    is_published: true,
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let count = 0;
    for (const v of sampleVehicles) {
      await Vehicle.findOneAndUpdate(
        { slug: v.slug },
        { $set: v },
        { upsert: true, new: true }
      );
      count++;
      console.log(`Seeded vehicle: ${v.name} (${v.slug})`);
    }

    console.log(`\nSuccessfully seeded ${count} sample electric vehicles!`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
