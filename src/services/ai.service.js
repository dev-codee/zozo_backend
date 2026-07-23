import Anthropic from '@anthropic-ai/sdk';
import env from '../config/env.js';

let anthropic;
if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
    anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
} else {
    console.warn("ANTHROPIC_API_KEY is not set or invalid. AI descriptions will not work.");
}

export const generatePhoneDescription = async (phoneName, specs) => {
    if (!anthropic) {
        console.warn("Skipping AI description generation because API key is missing.");
        return null;
    }

    try {
        const prompt = `
Write a highly detailed, professional, and to-the-point product description for the smartphone "${phoneName}". 
Use the following specifications as a reference:
${JSON.stringify(specs, null, 2)}

The description MUST follow these guidelines:
- Write in proper bullet points (using bullet character •).
- Keep it to the point, using simple English and a professional tone suitable for a top-tier e-commerce platform. Avoid fluffy marketing jargon.
- Highlight the standout features (e.g., camera capabilities, processing power, battery endurance, display quality).
- Explicitly deduce and explain extra features or capabilities that are typical for this phone's tier but might not be fully detailed in the raw specs (e.g., AI camera enhancements, gaming performance, software ecosystem benefits, build quality, and real-world usage scenarios).
- Make sure to get straight to the point without generic introductions.
- DO NOT use generic placeholders or mention that you are an AI.
- Format the response cleanly with each point on a new line starting with •. Do not use other markdown symbols.
        `;

        const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });

        return message.content[0].text;
    } catch (error) {
        console.error("Error generating description from Anthropic:", error);
        return null;
    }
};

export const generateAIComparison = async (phones) => {
    if (!anthropic) {
        console.warn("Skipping AI comparison because API key is missing.");
        return null;
    }

    try {
        const phoneDetails = phones.map(p => ({
            name: p.name,
            specs: p.specs,
            price: p.prices?.[0]?.price_pkr
        }));

        const prompt = `
You are an expert mobile technology reviewer. Please provide a detailed and professional comparison between the following smartphones:
${JSON.stringify(phoneDetails, null, 2)}

The comparison MUST follow these guidelines:
- Write a cohesive comparison detailing the key differences, strengths, and weaknesses of each device.
- Highlight which phone is better for specific use cases (e.g., gaming, photography, battery life, value for money).
- Provide a clear and definitive "Final Verdict" at the end.
- Maintain a premium, professional, and objective tone.
- Do not use any generic placeholders or mention that you are an AI.
- Format the response in plain text. DO NOT use markdown symbols like *, #, -, or bold/italic formatting.
        `;

        const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{ role: 'user', content: prompt }],
        });

        return message.content[0].text;
    } catch (error) {
        console.error("Error generating comparison from Anthropic:", error);
        return null;
    }
};

export const generatePhoneDataAdmin = async (phoneName) => {
    if (!anthropic) {
        console.warn("Skipping AI data generation because API key is missing.");
        return null;
    }

    try {
        const schemaString = `
{
  "brand_slug": "Brand name slugified (e.g. apple, samsung)",
  "model_number": "Model number if known",
  "release_date": "YYYY-MM-DD",
  "status": "available, upcoming, or discontinued",
  "specs": {
    "display": {
      "size_inches": 6.7,
      "resolution": "1290 x 2796 pixels",
      "type": "LTPO Super Retina XDR OLED",
      "refresh_rate_hz": 120,
      "protection": "Ceramic Shield glass",
      "peak_brightness_nits": 2000,
      "features": ["OLED", "AMOLED", "POLED", "LCD", "IPS", "LTPO", "Mini LED", "Foldable"] // keep only applicable ones
    },
    "performance": {
      "chipset": "A17 Pro",
      "cpu": "Hexa-core",
      "gpu": "Apple GPU",
      "ram_options_gb": [8],
      "storage_options_gb": [256, 512, 1024],
      "expandable_storage": false
    },
    "camera": {
      "rear_summary": "48 MP + 12 MP + 12 MP",
      "front_summary": "12 MP",
      "video_recording": "4K@24/25/30/60fps, 1080p@25/30/60/120/240fps",
      "video_features": ["8K", "4K", "HDR", "Dolby Vision", "Slow Motion", "Time Lapse", "Night Video", "Director Mode", "LOG", "Pro Video"] // keep only applicable
    },
    "battery": {
      "capacity_mah": 4441,
      "charging_watts": 27,
      "fast_charging": true,
      "wireless_charging": true
    },
    "body": {
      "height_mm": 159.9,
      "width_mm": 76.7,
      "thickness_mm": 8.3,
      "weight_g": 221,
      "materials": "Glass front, glass back, titanium frame",
      "water_resistance": "IP68"
    },
    "connectivity": {
      "network": "GSM / CDMA / HSPA / EVDO / LTE / 5G",
      "sim": "Nano-SIM and eSIM",
      "usb": "USB Type-C 3.2",
      "bluetooth": "5.3",
      "nfc": true,
      "network_features": ["2G", "3G", "4G", "5G", "VoLTE", "VoWiFi", "SA", "NSA", "Satellite", "Bands"], // keep only applicable
      "sim_types": ["Single", "Dual", "Triple", "Nano", "eSIM", "Hybrid"] // keep only applicable
    },
    "os": "iOS 17",
    "ai_features": ["Circle To Search", "Gemini", "Galaxy AI", "Apple Intelligence", "Live Translate", "Magic Eraser", "AI Photo", "AI Video", "AI Call", "AI Notes", "AI Writing", "AI Wallpaper", "AI Voice", "AI Search", "AI Assistant", "AI Summary", "AI Interpreter"], // keep applicable
    "extra_specs": {
      "price_section": {
        "store_name": "", "store_logo": "", "store_url": "", "affiliate_url": "",
        "current_price": "", "old_price": "", "discount_percent": "", "coupon": "", "cashback": "",
        "cod": false, "warranty": "", "delivery_time": "", "stock_status": "In Stock", "price_source": ""
      },
      "features_listing": {
        "pixels": "", "ppi": "", "aspect_ratio": "", "touch_sampling": "",
        "hdr": false, "hdr10": false, "hdr10_plus": false, "dolby_vision": false, "always_on_display": false,
        "screen_to_body": "", "color_depth": "", "pwm": "", "screen_design": "Flat/Curved", "notch_type": "Dynamic Island/Punch Hole/Notch/Waterdrop"
      },
      "processor": {
        "brand": "", "fabrication": "", "cpu_name": "", "cpu_clock": "", "cpu_cores": "", "gpu_clock": "", "ai_engine": "", "npu": "", "isp": ""
      },
      "ram_storage": {
        "ram_type": "", "ram_speed": "", "storage_type": "", "max_expansion": ""
      },
      "cameras_detailed": {
        "sensor_name": "", "mp": "", "aperture": "", "ois": false, "eis": false, "pdaf": false, "laser_af": false,
        "focal_length": "", "pixel_size": "", "sensor_size": "", "lens_type": "", "features": ""
      },
      "battery_detailed": {
        "type": "Li-Ion", "removable": false, "reverse_charging": false, "pd": false, "pps": false, "charger_included": false
      },
      "body_detailed": {
        "frame": "", "back_material": "", "ip_rating": "", "mil_std": ""
      },
      "connectivity_detailed": {
        "wifi": "", "infrared": false, "gps": "", "glonass": false, "otg": false, "uwb": false, "fm": false, "headphone_jack": false
      },
      "audio": {
        "stereo": false, "dolby": false, "hi_res": false, "snapdragon_sound": false, "speakers": "", "microphones": ""
      },
      "sensors": {
        "fingerprint": "Under display, optical/ultrasonic", "face_unlock": false, "accelerometer": false, "compass": false, "gyroscope": false, "barometer": false, "hall_sensor": false, "ambient_light": false, "proximity": false
      },
      "software": {
        "ui": "", "security_patch": "", "upgrade_promise": "", "years_updates": "", "bootloader": "", "rootable": false
      },
      "benchmarks": {
        "antutu": "", "geekbench": "", "3dmark": "", "pcmark": "", "gfxbench": "", "ai_benchmark": "", "dxomark": "", "battery_test": "", "charging_test": ""
      },
      "gaming": {
        "pubg_fps": "", "cod_fps": "", "free_fire_fps": "", "genshin_fps": "", "heating": "", "throttle": "", "cooling": "", "game_mode": false, "triggers": false
      },
      "ai_generated_content": {
        "ai_summary": "", "ai_pros": "", "ai_cons": "", "ai_verdict": "", "ai_comparison": "", "ai_buying_advice": "", "ai_faq": "", "ai_meta_title": "", "ai_meta_description": "", "ai_keywords": "", "ai_highlights": ""
      },
      "seo": {
        "slug": "", "canonical": "", "og_title": "", "og_image": "", "twitter_card": "", "schema": "", "breadcrumb": "", "faq_schema": false, "review_schema": false
      },
      "affiliate": {
        "commission_percent": "", "geo_redirect": false, "deep_link": ""
      },
      "moderation": {
        "fact_checked": false, "verified_specs": false, "ai_verified": true, "editor_approved": false
      },
      "ai_automation": {
        "auto_summary": true, "auto_pros_cons": true, "auto_buying_advice": true, "auto_faqs": true, "auto_comparison": true, "auto_seo_title": true, "auto_meta_description": true, "auto_alt_text": true, "auto_tag": true, "auto_categorize": true, "auto_link_related": true, "auto_detect_duplicate": true, "auto_translate": false, "auto_create_news": false, "auto_create_buying_guide": false, "auto_calc_value": true, "auto_update_price": false, "auto_recalc_score": true, "auto_monitor_competitors": false, "auto_summarize_reviews": false, "auto_extract_specs": true, "auto_schema": true
      },
      "colors": "Titanium Black, Titanium Gray"
    }
  }
}
        `;

        const prompt = `
You are an expert mobile technology database architect and researcher.
Your task is to generate a comprehensive JSON object containing all known specifications and features for the smartphone: "${phoneName}".
The output MUST strictly conform to the provided JSON schema. Ensure you research thoroughly and fill in as many fields accurately as possible. For arrays representing checkboxes (like display_features, video_recording_features, ai_features), only include the values from the schema example that actually apply to this phone. Leave fields as empty strings or false if the data is unavailable or inapplicable.

Do not wrap the response in markdown blocks like \`\`\`json. Return ONLY the raw valid JSON.

Here is the required schema:
${schemaString}
`;

        const message = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
        });

        const rawText = message.content[0].text;
        // Basic cleanup in case Claude adds markdown
        const jsonText = rawText.replace(/^[`\s]*json/i, '').replace(/[`\s]*$/i, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating AI data from Anthropic:", error);
        return null;
    }
};
