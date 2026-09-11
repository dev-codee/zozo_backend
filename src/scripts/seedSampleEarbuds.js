import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Earbud } from '../models/Earbud.model.js';
import { Brand } from '../models/Brand.model.js';
import { slugify } from '../utils/slugify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sampleBrands = [
  { name: "Apple", slug: "apple", type: "phone" },
  { name: "Sony", slug: "sony", type: "earbud" },
  { name: "Soundcore", slug: "soundcore", type: "earbud" },
  { name: "Samsung", slug: "samsung", type: "phone" },
  { name: "Xiaomi", slug: "xiaomi", type: "phone" },
  { name: "Audionic", slug: "audionic", type: "earbud" },
  { name: "Realme", slug: "realme", type: "phone" },
];

const sampleEarbuds = [
  {
    name: "Apple AirPods Pro (2nd Generation)",
    slug: "apple-airpods-pro-2",
    brand_slug: "apple",
    model_number: "A2968",
    release_date: new Date("2023-09-22"),
    description: "The second-generation Apple AirPods Pro deliver up to 2x more Active Noise Cancellation, Adaptive Audio, and Transparency mode. Powered by the H2 headphone chip, they provide rich immersive sound, personalized spatial audio with dynamic head tracking, and seamless switching across Apple devices.",
    status: "available",
    wearing_type: "In-Ear",
    colors: ["White"],
    country_availability: ["Pakistan", "Global"],
    made_in: "China",
    tags: ["Apple", "AirPods", "ANC", "Flagship", "Wireless Charging"],
    video_url: "https://www.youtube.com/watch?v=fWe_PXflw3U",
    price_pkr: 64999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
        cloud_public_id: "airpods_pro_2_main",
        is_primary: true,
        alt_text: "Apple AirPods Pro 2 Price in Pakistan - ZOZO",
      },
    ],
    specs: {
      audio: {
        driver_type: "Custom High-Excursion Apple Driver",
        driver_size_mm: 11,
        frequency_min_hz: 20,
        frequency_max_hz: 20000,
        impedance_ohms: 32,
        sensitivity_db: 105,
        hi_res_audio: false,
        spatial_audio: "Personalized Spatial Audio with Dynamic Head Tracking",
        sound_features: ["Adaptive EQ", "Custom High Dynamic Range Amplifier"],
      },
      noise_cancellation: {
        has_anc: true,
        anc_depth_db: 48,
        anc_type: "Active Noise Cancellation with Adaptive Audio",
        transparency_mode: true,
        enc_call_noise_reduction: true,
        mic_count_total: 4,
        mic_count_per_earbud: 2,
        wind_noise_reduction: true,
        mic_tech_features: ["Dual Beamforming Mics", "Inward-Facing Mic", "Vent System for Pressure Equalization"],
      },
      battery: {
        earbud_battery_mah: 44,
        case_battery_mah: 523,
        playtime_earbuds_anc_off_hrs: 7,
        playtime_earbuds_anc_on_hrs: 6,
        total_playtime_with_case_hrs: 30,
        charging_port: "USB Type-C",
        fast_charging: true,
        fast_charge_summary: "5 minutes in the case provides around 1 hour of listening time",
        earbud_charge_time_mins: 45,
        case_charge_time_mins: 100,
        wireless_charging: true,
      },
      connectivity: {
        bluetooth_version: "5.3",
        bluetooth_range_meters: 15,
        codecs: ["AAC", "SBC"],
        multipoint_pairing: true,
        google_fast_pair: false,
        low_latency_gaming_mode: true,
        latency_ms: 120,
        app_support: "iOS Settings Integration / Find My",
      },
      physical: {
        water_resistance: "IP54",
        case_water_resistance: "IP54",
        earbud_weight_g: 5.3,
        case_weight_g: 50.8,
        total_weight_g: 61.4,
        earbud_dimensions_mm: "30.9 x 21.8 x 24.0 mm",
        case_dimensions_mm: "45.2 x 60.6 x 21.7 mm",
      },
      controls: {
        control_type: "Touch & Force Sensor with Swipe Volume",
        volume_control: true,
        in_ear_detection: true,
        voice_assistant: ["Siri"],
        extra_features: ["Find My with Precision Finding", "Case Speaker for Chimes", "Lanyard Loop"],
      },
      in_the_box: [
        "AirPods Pro (2nd Gen)",
        "MagSafe Charging Case (USB-C)",
        "Silicone Ear Tips (XS, S, M, L)",
        "USB-C Charge Cable",
        "Documentation"
      ],
    },
    prices: [
      {
        retailer_slug: "priceoye",
        retailer_name: "PriceOye",
        price_pkr: 64999,
        stock_status: "In Stock",
        product_url: "https://priceoye.pk",
      },
      {
        retailer_slug: "daraz",
        retailer_name: "Daraz",
        price_pkr: 67999,
        stock_status: "In Stock",
        product_url: "https://daraz.pk",
      },
    ],
    price_history: [
      { date: new Date("2024-01-15"), price_pkr: 69999, source: "Launch Price" },
      { date: new Date("2024-06-01"), price_pkr: 64999, source: "Market Adjustment" },
    ],
    rating: { average: 4.8, count: 142 },
    view_count: 850,
    approvalStatus: "APPROVED",
    is_published: true,
    seo: {
      meta_title: "Apple AirPods Pro 2 Price in Pakistan & Specs",
      meta_description: "Check Apple AirPods Pro 2 price in Pakistan with full technical specifications, ANC depth, battery life, and retailer deals.",
      ai_summary: "The Apple AirPods Pro 2 remains the premier wireless earbud choice for Apple users, boasting unmatched noise cancellation, crystal clear transparency mode, and superior spatial audio.",
      ai_pros: ["Industry-leading Active Noise Cancellation", "Adaptive Transparency mode sounds natural", "Intuitive swipe volume controls", "IP54 dust and water resistance for buds and case"],
      ai_cons: ["No LDAC or Hi-Res codec support on Android", "Premium price point"],
      ai_buying_advice: "An essential purchase for iPhone, iPad, and Mac users seeking flawless integration and exceptional noise cancellation.",
      ai_faq: [
        { question: "What is the price of Apple AirPods Pro 2 in Pakistan?", answer: "The Apple AirPods Pro 2 is officially priced around Rs. 64,999 in Pakistan across verified retailers like PriceOye." },
        { question: "Does AirPods Pro 2 support wireless charging?", answer: "Yes, it supports MagSafe, Qi-certified wireless charging, and Apple Watch chargers." },
        { question: "How long does the battery last?", answer: "Up to 6 hours on a single charge with ANC on, and up to 30 hours total with the USB-C charging case." }
      ],
    },
  },
  {
    name: "Sony WF-1000XM5",
    slug: "sony-wf-1000xm5",
    brand_slug: "sony",
    model_number: "YY2963",
    release_date: new Date("2023-08-10"),
    description: "The Sony WF-1000XM5 features cutting-edge technology to deliver premium sound quality and the best noise-canceling performance on the market. Real-time audio processors and high-performance mics power the specially designed Dynamic Driver X for wide frequency reproduction and deep bass.",
    status: "available",
    wearing_type: "In-Ear",
    colors: ["Black", "Silver"],
    country_availability: ["Pakistan", "Global"],
    made_in: "Malaysia",
    tags: ["Sony", "Hi-Res", "LDAC", "Flagship", "ANC"],
    video_url: "https://www.youtube.com/watch?v=S4B_J_J0t6I",
    price_pkr: 79999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        cloud_public_id: "sony_wf1000xm5_main",
        is_primary: true,
        alt_text: "Sony WF-1000XM5 Price in Pakistan - ZOZO",
      },
    ],
    specs: {
      audio: {
        driver_type: "Dynamic Driver X",
        driver_size_mm: 8.4,
        frequency_min_hz: 20,
        frequency_max_hz: 40000,
        impedance_ohms: 16,
        sensitivity_db: 108,
        hi_res_audio: true,
        spatial_audio: "360 Reality Audio with Head Tracking",
        sound_features: ["DSEE Extreme audio upscaling", "Custom 20-band EQ", "Personalized Sound Pressure"],
      },
      noise_cancellation: {
        has_anc: true,
        anc_depth_db: 50,
        anc_type: "Dual Processor Hybrid HD Noise Cancelling (QN2e + V2)",
        transparency_mode: true,
        enc_call_noise_reduction: true,
        mic_count_total: 6,
        mic_count_per_earbud: 3,
        wind_noise_reduction: true,
        mic_tech_features: ["Bone Conduction Sensors", "AI DNN Noise Reduction", "Mesh Wind Shield"],
      },
      battery: {
        earbud_battery_mah: 70,
        case_battery_mah: 500,
        playtime_earbuds_anc_off_hrs: 12,
        playtime_earbuds_anc_on_hrs: 8,
        total_playtime_with_case_hrs: 36,
        charging_port: "USB Type-C",
        fast_charging: true,
        fast_charge_summary: "3 minutes quick charge provides up to 60 minutes playtime",
        earbud_charge_time_mins: 90,
        case_charge_time_mins: 120,
        wireless_charging: true,
      },
      connectivity: {
        bluetooth_version: "5.3",
        bluetooth_range_meters: 10,
        codecs: ["LDAC", "AAC", "SBC", "LC3"],
        multipoint_pairing: true,
        google_fast_pair: true,
        low_latency_gaming_mode: true,
        latency_ms: 80,
        app_support: "Sony | Headphones Connect App",
      },
      physical: {
        water_resistance: "IPX4",
        case_water_resistance: "None",
        earbud_weight_g: 5.9,
        case_weight_g: 39,
        total_weight_g: 50.8,
        earbud_dimensions_mm: "24.5 x 19.8 x 26.5 mm",
        case_dimensions_mm: "64.6 x 40.0 x 26.5 mm",
      },
      controls: {
        control_type: "Capacitive Touch Controls",
        volume_control: true,
        in_ear_detection: true,
        voice_assistant: ["Google Assistant", "Alexa", "Siri"],
        extra_features: ["Speak-to-Chat", "Quick Attention Mode"],
      },
      in_the_box: [
        "Sony WF-1000XM5 Earbuds",
        "Charging Case",
        "Noise Isolation Earbud Tips (SS, S, M, L)",
        "USB Type-C Cable (approx. 20 cm)",
        "Reference Guide"
      ],
    },
    prices: [
      {
        retailer_slug: "priceoye",
        retailer_name: "PriceOye",
        price_pkr: 79999,
        stock_status: "In Stock",
        product_url: "https://priceoye.pk",
      },
    ],
    price_history: [
      { date: new Date("2024-02-01"), price_pkr: 84999, source: "Market Entry" },
      { date: new Date("2024-07-10"), price_pkr: 79999, source: "Promotion" },
    ],
    rating: { average: 4.9, count: 88 },
    view_count: 620,
    approvalStatus: "APPROVED",
    is_published: true,
    seo: {
      meta_title: "Sony WF-1000XM5 Price in Pakistan & Specs",
      meta_description: "Explore Sony WF-1000XM5 earbuds price in Pakistan with LDAC Hi-Res audio, dual QN2e noise cancelling processors, and 36-hour total battery.",
      ai_summary: "Sony WF-1000XM5 sets the benchmark for audiophile wireless earbuds, with breathtaking resolution via LDAC and whisper-quiet ANC.",
      ai_pros: ["Superb Hi-Res sound fidelity with LDAC", "Top-tier active noise cancellation", "Comfortable memory foam ear tips", "Multipoint connection across 2 devices"],
      ai_cons: ["Glossy sides can be slippery to handle", "High price tier"],
      ai_buying_advice: "The ultimate choice for music enthusiasts and frequent travelers demanding the purest audio reproduction and highest ANC isolation.",
      ai_faq: [
        { question: "What is the price of Sony WF-1000XM5 in Pakistan?", answer: "The Sony WF-1000XM5 price in Pakistan is approximately Rs. 79,999." },
        { question: "Do these earbuds support Hi-Res Audio wireless?", answer: "Yes, they support LDAC transmission delivering up to 990 kbps for certified Hi-Res Audio Wireless." }
      ],
    },
  },
  {
    name: "Soundcore Liberty 4 NC",
    slug: "soundcore-liberty-4-nc",
    brand_slug: "soundcore",
    model_number: "A3947",
    release_date: new Date("2023-06-29"),
    description: "Soundcore by Anker Liberty 4 NC is an all-around champion offering 98.5% noise reduction with Adaptive ANC 2.0. Packed with an 11mm custom driver, Hi-Res Wireless with LDAC, and an astonishing 50 hours of total playtime, it redefines value in the premium mid-range segment.",
    status: "available",
    wearing_type: "In-Ear",
    colors: ["Clear White", "Velvet Black", "Light Blue", "Pastel Pink", "Naval Blue"],
    country_availability: ["Pakistan", "Global"],
    made_in: "China",
    tags: ["Soundcore", "ANC", "Best Value", "Long Battery", "Hi-Res"],
    video_url: "https://www.youtube.com/watch?v=0kQp2Lp6q4k",
    price_pkr: 21999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
        cloud_public_id: "soundcore_liberty4nc_main",
        is_primary: true,
        alt_text: "Soundcore Liberty 4 NC Price in Pakistan - ZOZO",
      },
    ],
    specs: {
      audio: {
        driver_type: "Custom Tuned Dynamic Driver",
        driver_size_mm: 11,
        frequency_min_hz: 20,
        frequency_max_hz: 40000,
        impedance_ohms: 16,
        sensitivity_db: 104,
        hi_res_audio: true,
        spatial_audio: "3D Spatial Audio Mode",
        sound_features: ["HearID 2.0 Personalized Sound", "22 Custom EQ Presets"],
      },
      noise_cancellation: {
        has_anc: true,
        anc_depth_db: 48,
        anc_type: "Adaptive ANC 2.0 (Real-time in-ear & environment calculation)",
        transparency_mode: true,
        enc_call_noise_reduction: true,
        mic_count_total: 6,
        mic_count_per_earbud: 3,
        wind_noise_reduction: true,
        mic_tech_features: ["6-Mic AI Clear Calls", "Wind Noise Suppression Chamber"],
      },
      battery: {
        earbud_battery_mah: 53,
        case_battery_mah: 800,
        playtime_earbuds_anc_off_hrs: 10,
        playtime_earbuds_anc_on_hrs: 8,
        total_playtime_with_case_hrs: 50,
        charging_port: "USB Type-C",
        fast_charging: true,
        fast_charge_summary: "10 minutes charge = 4 hours of music playtime",
        earbud_charge_time_mins: 60,
        case_charge_time_mins: 150,
        wireless_charging: true,
      },
      connectivity: {
        bluetooth_version: "5.3",
        bluetooth_range_meters: 10,
        codecs: ["LDAC", "AAC", "SBC"],
        multipoint_pairing: true,
        google_fast_pair: true,
        low_latency_gaming_mode: true,
        latency_ms: 60,
        app_support: "Soundcore App (iOS & Android)",
      },
      physical: {
        water_resistance: "IPX4",
        case_water_resistance: "None",
        earbud_weight_g: 4.9,
        case_weight_g: 45,
        total_weight_g: 54.8,
        earbud_dimensions_mm: "31.2 x 22.0 x 24.5 mm",
        case_dimensions_mm: "58.2 x 58.2 x 29.8 mm",
      },
      controls: {
        control_type: "Touch Controls with Custom Re-mapping",
        volume_control: true,
        in_ear_detection: true,
        voice_assistant: ["Google Assistant", "Siri"],
        extra_features: ["Pop-up Case Button", "Find My Buds"],
      },
      in_the_box: [
        "Soundcore Liberty 4 NC Earbuds",
        "Charging Case",
        "XS/S/M/L Ear Tips",
        "USB-C Cable",
        "Quick Start Guide"
      ],
    },
    prices: [
      {
        retailer_slug: "priceoye",
        retailer_name: "PriceOye",
        price_pkr: 21999,
        stock_status: "In Stock",
        product_url: "https://priceoye.pk",
      },
    ],
    price_history: [
      { date: new Date("2024-03-01"), price_pkr: 24999, source: "Official Release" },
      { date: new Date("2024-08-01"), price_pkr: 21999, source: "Best Online Deal" },
    ],
    rating: { average: 4.7, count: 215 },
    view_count: 1240,
    approvalStatus: "APPROVED",
    is_published: true,
    seo: {
      meta_title: "Soundcore Liberty 4 NC Price in Pakistan & Specs",
      meta_description: "Discover Soundcore Liberty 4 NC price in Pakistan with 98.5% Adaptive ANC, 50-hour colossal battery, LDAC Hi-Res support, and wireless charging.",
      ai_summary: "Widely regarded as the best value wireless earbuds under 25k in Pakistan, Liberty 4 NC punches far above its price category in noise isolation and battery stamina.",
      ai_pros: ["Unbeatable battery life up to 50 hours", "Flagship grade 48dB Adaptive ANC", "LDAC codec and customizable EQ", "Qi wireless charging support"],
      ai_cons: ["Case is slightly chunkier than competitors", "Default sound profile is bass-heavy (needs EQ tweak)"],
      ai_buying_advice: "If your budget is around 20,000 to 25,000 PKR, this is the absolute top recommendation for students, professionals, and daily commuters.",
      ai_faq: [
        { question: "Is Soundcore Liberty 4 NC available in Pakistan?", answer: "Yes, it is readily available with official warranty across PriceOye and local gadget retailers." },
        { question: "Does it work with iPhone?", answer: "Yes, it works seamlessly with both iOS and Android via the feature-rich Soundcore app." }
      ],
    },
  },
  {
    name: "Samsung Galaxy Buds 2 Pro",
    slug: "samsung-galaxy-buds-2-pro",
    brand_slug: "samsung",
    model_number: "SM-R510",
    release_date: new Date("2022-08-26"),
    description: "Samsung Galaxy Buds 2 Pro features 24-bit Hi-Fi audio playback, intelligent 360 Audio with enhanced multi-channel direct sound, and ergonomic design that fits comfortably into your ear. Powerful 3-mic ANC filters out background noise for studio-level listening.",
    status: "available",
    wearing_type: "In-Ear",
    colors: ["Graphite", "White", "Bora Purple"],
    country_availability: ["Pakistan", "Global"],
    made_in: "Vietnam",
    tags: ["Samsung", "Galaxy", "Hi-Fi", "IPX7", "ANC"],
    video_url: "https://www.youtube.com/watch?v=kYJj8w51mGQ",
    price_pkr: 38500,
    images: [
      {
        url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
        cloud_public_id: "galaxy_buds_2_pro_main",
        is_primary: true,
        alt_text: "Samsung Galaxy Buds 2 Pro Price in Pakistan - ZOZO",
      },
    ],
    specs: {
      audio: {
        driver_type: "Custom Coaxial 2-Way (Woofer + Tweeter)",
        driver_size_mm: 10,
        frequency_min_hz: 20,
        frequency_max_hz: 20000,
        impedance_ohms: 16,
        sensitivity_db: 102,
        hi_res_audio: true,
        spatial_audio: "Intelligent 360 Audio with Direct Multi-Channel",
        sound_features: ["Samsung Seamless Codec (SSC) 24-bit", "AKG Sound Tuning"],
      },
      noise_cancellation: {
        has_anc: true,
        anc_depth_db: 46,
        anc_type: "Intelligent Active Noise Cancellation",
        transparency_mode: true,
        enc_call_noise_reduction: true,
        mic_count_total: 6,
        mic_count_per_earbud: 3,
        wind_noise_reduction: true,
        mic_tech_features: ["High-SNR Microphones", "Voice Detect (auto switch to ambient on speaking)"],
      },
      battery: {
        earbud_battery_mah: 61,
        case_battery_mah: 515,
        playtime_earbuds_anc_off_hrs: 8,
        playtime_earbuds_anc_on_hrs: 5,
        total_playtime_with_case_hrs: 29,
        charging_port: "USB Type-C",
        fast_charging: true,
        fast_charge_summary: "5 minutes charge = 55 minutes playtime",
        earbud_charge_time_mins: 50,
        case_charge_time_mins: 110,
        wireless_charging: true,
      },
      connectivity: {
        bluetooth_version: "5.3",
        bluetooth_range_meters: 10,
        codecs: ["SSC (Samsung Seamless Codec)", "AAC", "SBC"],
        multipoint_pairing: true,
        google_fast_pair: true,
        low_latency_gaming_mode: true,
        latency_ms: 80,
        app_support: "Galaxy Wearable App",
      },
      physical: {
        water_resistance: "IPX7",
        case_water_resistance: "IPX2",
        earbud_weight_g: 5.5,
        case_weight_g: 43.4,
        total_weight_g: 54.4,
        earbud_dimensions_mm: "21.6 x 19.9 x 18.7 mm",
        case_dimensions_mm: "50.2 x 50.1 x 27.7 mm",
      },
      controls: {
        control_type: "Touch Controls with Edge Tap Volume",
        volume_control: true,
        in_ear_detection: true,
        voice_assistant: ["Bixby", "Google Assistant"],
        extra_features: ["SmartThings Find", "Neck Stretch Reminder"],
      },
      in_the_box: [
        "Galaxy Buds 2 Pro",
        "Wireless Charging Case",
        "Ear Tips (S, M, L)",
        "USB-C to USB-C Cable",
        "Quick Start Guide"
      ],
    },
    prices: [
      {
        retailer_slug: "priceoye",
        retailer_name: "PriceOye",
        price_pkr: 38500,
        stock_status: "In Stock",
        product_url: "https://priceoye.pk",
      },
    ],
    price_history: [
      { date: new Date("2024-01-01"), price_pkr: 42000, source: "Market Rate" },
      { date: new Date("2024-05-15"), price_pkr: 38500, source: "Price Drop" },
    ],
    rating: { average: 4.6, count: 110 },
    view_count: 730,
    approvalStatus: "APPROVED",
    is_published: true,
    seo: {
      meta_title: "Samsung Galaxy Buds 2 Pro Price in Pakistan & Specs",
      meta_description: "Check Samsung Galaxy Buds 2 Pro price in Pakistan. Features 24-bit Hi-Fi sound, IPX7 waterproof rating, Voice Detect, and wireless charging.",
      ai_summary: "Galaxy Buds 2 Pro is the premier audio companion for Samsung Galaxy smartphone owners, featuring IPX7 water submersion protection and 24-bit SSC audio.",
      ai_pros: ["IPX7 water resistance rating (survives water submersion)", "Dual 2-way coaxial drivers for sparkling highs and clean bass", "Compact and comfortable matte pebble design", "Voice Detect auto-activates ambient mode"],
      ai_cons: ["24-bit audio requires a Samsung Galaxy phone", "Average battery life with ANC on (around 5 hours)"],
      ai_buying_advice: "The premier earbud choice if you use a Samsung smartphone or exercise frequently thanks to the IPX7 waterproof rating.",
      ai_faq: [
        { question: "Is Samsung Galaxy Buds 2 Pro waterproof?", answer: "Yes, it has an IPX7 rating meaning it can withstand immersion in up to 1 meter of fresh water for up to 30 minutes." },
        { question: "What is its price in Pakistan?", answer: "Galaxy Buds 2 Pro retails around Rs. 38,500 in Pakistan." }
      ],
    },
  },
  {
    name: "Redmi Buds 5 Pro",
    slug: "redmi-buds-5-pro",
    brand_slug: "xiaomi",
    model_number: "M2317E1",
    release_date: new Date("2024-01-15"),
    description: "Redmi Buds 5 Pro delivers flagship acoustic performance with a custom coaxial dual-driver acoustic design (10mm piezoelectric ceramic tweeter + 11mm titanium dynamic woofer). Featuring up to 52dB ultra-deep Active Noise Cancellation and LDAC Hi-Res Audio certification.",
    status: "available",
    wearing_type: "In-Ear",
    colors: ["Midnight Black", "Moonlight White", "Aurora Purple"],
    country_availability: ["Pakistan", "Global"],
    made_in: "China",
    tags: ["Xiaomi", "Redmi", "52dB ANC", "Dual Driver", "LDAC"],
    video_url: "https://www.youtube.com/watch?v=kYJj8w51mGQ",
    price_pkr: 16499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
        cloud_public_id: "redmi_buds_5_pro_main",
        is_primary: true,
        alt_text: "Redmi Buds 5 Pro Price in Pakistan - ZOZO",
      },
    ],
    specs: {
      audio: {
        driver_type: "Coaxial Dual Drivers (10mm Ceramic Tweeter + 11mm Titanium Woofer)",
        driver_size_mm: 11,
        frequency_min_hz: 20,
        frequency_max_hz: 40000,
        impedance_ohms: 16,
        sensitivity_db: 106,
        hi_res_audio: true,
        spatial_audio: "Built-in Immersive Sound with Music & Video Modes",
        sound_features: ["3 Sound Modes", "Customizable EQ"],
      },
      noise_cancellation: {
        has_anc: true,
        anc_depth_db: 52,
        anc_type: "Ultra-Deep Hybrid ANC (up to 4kHz ultra-wide frequency)",
        transparency_mode: true,
        enc_call_noise_reduction: true,
        mic_count_total: 6,
        mic_count_per_earbud: 3,
        wind_noise_reduction: true,
        mic_tech_features: ["3-Mic AI Anti-Wind Noise Algorithm (up to 9m/s wind)"],
      },
      battery: {
        earbud_battery_mah: 54,
        case_battery_mah: 480,
        playtime_earbuds_anc_off_hrs: 10,
        playtime_earbuds_anc_on_hrs: 6.5,
        total_playtime_with_case_hrs: 38,
        charging_port: "USB Type-C",
        fast_charging: true,
        fast_charge_summary: "5 minutes charge provides 2 hours of music listening",
        earbud_charge_time_mins: 55,
        case_charge_time_mins: 110,
        wireless_charging: false,
      },
      connectivity: {
        bluetooth_version: "5.3",
        bluetooth_range_meters: 10,
        codecs: ["LDAC", "AAC", "SBC", "LC3"],
        multipoint_pairing: true,
        google_fast_pair: true,
        low_latency_gaming_mode: true,
        latency_ms: 49,
        app_support: "Xiaomi Earbuds App",
      },
      physical: {
        water_resistance: "IP54",
        case_water_resistance: "None",
        earbud_weight_g: 5.1,
        case_weight_g: 42.8,
        total_weight_g: 53.0,
        earbud_dimensions_mm: "31.0 x 21.4 x 23.5 mm",
        case_dimensions_mm: "61.0 x 48.0 x 25.0 mm",
      },
      controls: {
        control_type: "Touch Controls",
        volume_control: true,
        in_ear_detection: true,
        voice_assistant: ["Google Assistant", "Siri"],
        extra_features: ["Dual Device Smart Connection", "Earbud Seal Test"],
      },
      in_the_box: [
        "Redmi Buds 5 Pro Earbuds",
        "Charging Case",
        "Ear Tips (S/M/L)",
        "Type-C Charging Cable",
        "User Manual"
      ],
    },
    prices: [
      {
        retailer_slug: "priceoye",
        retailer_name: "PriceOye",
        price_pkr: 16499,
        stock_status: "In Stock",
        product_url: "https://priceoye.pk",
      },
    ],
    price_history: [
      { date: new Date("2024-04-01"), price_pkr: 17999, source: "Launch Price" },
      { date: new Date("2024-08-10"), price_pkr: 16499, source: "Deal Price" },
    ],
    rating: { average: 4.6, count: 95 },
    view_count: 510,
    approvalStatus: "APPROVED",
    is_published: true,
    seo: {
      meta_title: "Redmi Buds 5 Pro Price in Pakistan & Specs",
      meta_description: "Redmi Buds 5 Pro price in Pakistan with 52dB ultra-deep ANC, coaxial dual drivers, LDAC audio, and 38-hour battery.",
      ai_summary: "Featuring an astonishing 52dB ANC and coaxial dual drivers normally reserved for 40k+ earbuds, Redmi Buds 5 Pro sets an immense standard for budget performance.",
      ai_pros: ["Massive 52dB Active Noise Cancellation", "Dual driver design delivers crispy highs and punchy bass", "Sub-50ms ultra low latency mode for gaming", "LDAC codec support"],
      ai_cons: ["No Qi wireless charging", "Vegan leather case edition only available on Black variant"],
      ai_buying_advice: "A top contender for under 18,000 PKR, ideal for commuters needing strong ANC and mobile gamers wanting minimal audio lag.",
      ai_faq: [
        { question: "How much is Redmi Buds 5 Pro in Pakistan?", answer: "It is priced at approximately Rs. 16,499 in Pakistan." },
        { question: "Can it connect to phone and laptop at the same time?", answer: "Yes, dual-device smart connection allows simultaneous pairing with phone and laptop." }
      ],
    },
  },
  {
    name: "Audionic Airbud 550",
    slug: "audionic-airbud-550",
    brand_slug: "audionic",
    model_number: "Airbud 550",
    release_date: new Date("2023-11-05"),
    description: "Audionic Airbud 550 is a popular budget wireless earbud in Pakistan engineered for daily use, online classes, and casual gaming. It features Quad Mic Environmental Noise Cancellation (ENC) for clear calling, ultra-low latency gaming mode, and up to 45 hours of playtime.",
    status: "available",
    wearing_type: "In-Ear",
    colors: ["Black", "White", "Blue"],
    country_availability: ["Pakistan"],
    made_in: "Pakistan",
    tags: ["Audionic", "Budget", "ENC", "Gaming", "Local Brand"],
    video_url: "https://www.youtube.com/watch?v=0kQp2Lp6q4k",
    price_pkr: 4999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80",
        cloud_public_id: "audionic_airbud_550_main",
        is_primary: true,
        alt_text: "Audionic Airbud 550 Price in Pakistan - ZOZO",
      },
    ],
    specs: {
      audio: {
        driver_type: "Dynamic Bass Boost Driver",
        driver_size_mm: 10,
        frequency_min_hz: 20,
        frequency_max_hz: 20000,
        impedance_ohms: 32,
        sensitivity_db: 98,
        hi_res_audio: false,
        spatial_audio: "None",
        sound_features: ["Extra Bass Boost", "Clear Vocal Tuning"],
      },
      noise_cancellation: {
        has_anc: false,
        anc_depth_db: 0,
        anc_type: "None",
        transparency_mode: false,
        enc_call_noise_reduction: true,
        mic_count_total: 4,
        mic_count_per_earbud: 2,
        wind_noise_reduction: false,
        mic_tech_features: ["Quad Mic ENC (Environmental Noise Cancellation for Calls)"],
      },
      battery: {
        earbud_battery_mah: 40,
        case_battery_mah: 400,
        playtime_earbuds_anc_off_hrs: 7,
        playtime_earbuds_anc_on_hrs: 7,
        total_playtime_with_case_hrs: 45,
        charging_port: "USB Type-C",
        fast_charging: true,
        fast_charge_summary: "10 minutes charge = 1.5 hours playtime",
        earbud_charge_time_mins: 60,
        case_charge_time_mins: 90,
        wireless_charging: false,
      },
      connectivity: {
        bluetooth_version: "5.3",
        bluetooth_range_meters: 10,
        codecs: ["AAC", "SBC"],
        multipoint_pairing: false,
        google_fast_pair: false,
        low_latency_gaming_mode: true,
        latency_ms: 45,
        app_support: "None",
      },
      physical: {
        water_resistance: "IPX4",
        case_water_resistance: "None",
        earbud_weight_g: 4.2,
        case_weight_g: 38,
        total_weight_g: 46.4,
        earbud_dimensions_mm: "30.0 x 20.0 x 22.0 mm",
        case_dimensions_mm: "55.0 x 48.0 x 25.0 mm",
      },
      controls: {
        control_type: "Smart Touch Controls",
        volume_control: false,
        in_ear_detection: false,
        voice_assistant: ["Google Assistant", "Siri"],
        extra_features: ["Gaming Mode Indicator LED"],
      },
      in_the_box: [
        "Audionic Airbud 550 Earbuds",
        "Charging Case",
        "Extra Ear Tips",
        "Type-C Charging Cable",
        "Warranty Card & Manual"
      ],
    },
    prices: [
      {
        retailer_slug: "daraz",
        retailer_name: "Daraz",
        price_pkr: 4999,
        stock_status: "In Stock",
        product_url: "https://daraz.pk",
      },
      {
        retailer_slug: "priceoye",
        retailer_name: "PriceOye",
        price_pkr: 5299,
        stock_status: "In Stock",
        product_url: "https://priceoye.pk",
      },
    ],
    price_history: [
      { date: new Date("2024-01-01"), price_pkr: 5499, source: "Original Price" },
      { date: new Date("2024-06-01"), price_pkr: 4999, source: "Discounted Price" },
    ],
    rating: { average: 4.3, count: 320 },
    view_count: 980,
    approvalStatus: "APPROVED",
    is_published: true,
    seo: {
      meta_title: "Audionic Airbud 550 Price in Pakistan & Specs",
      meta_description: "Audionic Airbud 550 wireless earbuds price in Pakistan with 45-hour battery, Quad Mic ENC calling, 45ms gaming mode, and Type-C fast charging.",
      ai_summary: "Audionic Airbud 550 is a top-selling budget earbud in Pakistan, providing reliable calling with Quad Mic ENC and extended 45-hour battery life under 5,000 PKR.",
      ai_pros: ["Highly affordable price under Rs. 5,000", "Quad mic ENC clear voice calling", "Low latency 45ms gaming mode", "Local 1-year brand warranty in Pakistan"],
      ai_cons: ["No Active Noise Cancellation (ANC)", "No companion mobile app"],
      ai_buying_advice: "An excellent entry-level choice for students and users who need reliable call quality and strong battery backup on a tight budget.",
      ai_faq: [
        { question: "What is the price of Audionic Airbud 550 in Pakistan?", answer: "The Audionic Airbud 550 is available for around Rs. 4,999 in Pakistan." },
        { question: "Does Audionic Airbud 550 have a warranty?", answer: "Yes, it comes with a 1-year official warranty from Audionic Pakistan." }
      ],
    },
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully.");

    // Seed Brands
    for (const b of sampleBrands) {
      await Brand.findOneAndUpdate(
        { slug: b.slug },
        { $set: { name: b.name, slug: b.slug, type: b.type } },
        { upsert: true, new: true }
      );
    }
    console.log(`Ensured ${sampleBrands.length} brands exist.`);

    // Seed Earbuds
    for (const earbud of sampleEarbuds) {
      await Earbud.findOneAndUpdate(
        { slug: earbud.slug },
        { $set: earbud },
        { upsert: true, new: true }
      );
      console.log(`Seeded earbud: ${earbud.name}`);
    }

    console.log(`Seeded ${sampleEarbuds.length} earbuds successfully!`);
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
