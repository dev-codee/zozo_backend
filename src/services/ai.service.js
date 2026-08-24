import env from '../config/env.js';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

if (!env.PERPLEXITY_API_KEY || env.PERPLEXITY_API_KEY === 'your_perplexity_api_key_here') {
  console.warn("PERPLEXITY_API_KEY is not set or invalid. AI descriptions will not work.");
}

const callPerplexity = async (systemPrompt, userPrompt, options = {}) => {
  if (!env.PERPLEXITY_API_KEY) return null;

  const {
    model = 'sonar-pro',
    // Leave undefined so the model uses its full completion budget — capping
    // max_tokens is what truncates long spec JSON and drops fields. Only set
    // this when you deliberately want a short answer.
    maxTokens = undefined,
    temperature = 0.2,
    // 'low' | 'medium' | 'high' — how much web-search context Perplexity pulls
    // in before answering. 'high' = more sources read = more accurate specs.
    searchContextSize = 'medium',
    returnCitations = false,
  } = options;

  const body = {
    model,
    temperature,
    web_search_options: { search_context_size: searchContextSize },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  };
  if (maxTokens != null) body.max_tokens = maxTokens;

  const response = await fetch(PERPLEXITY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Perplexity API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? null;

  if (returnCitations) {
    // Perplexity returns sources under `citations` (URLs) and/or `search_results`.
    return { content, citations: data.citations || [], searchResults: data.search_results || [] };
  }
  return content;
};

// Robustly pull a JSON object out of an LLM response even if it is wrapped in
// ```json fences or has leading/trailing prose. Returns null if unparseable.
const parseJsonObject = (rawText) => {
  if (!rawText) return null;
  let text = rawText.trim();

  // Strip ```json ... ``` fences if the model added them despite instructions.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  // Grab from the first "{" to the last "}" to drop any surrounding prose.
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
};

export const generatePhoneDescription = async (phoneName, specs, tags = []) => {
  if (!env.PERPLEXITY_API_KEY) {
    console.warn("Skipping AI description generation because API key is missing.");
    return null;
  }

  try {
    const isFlagship = (tags || []).some(t => t.toLowerCase() === 'flagship' || t.toLowerCase() === 'premium') ||
      (specs?.performance?.chipset && (
        specs.performance.chipset.toLowerCase().includes('apple a18 pro') ||
        specs.performance.chipset.toLowerCase().includes('apple a17 pro') ||
        specs.performance.chipset.toLowerCase().includes('snapdragon 8 elite') ||
        specs.performance.chipset.toLowerCase().includes('snapdragon 8 gen 3') ||
        specs.performance.chipset.toLowerCase().includes('dimensity 9400') ||
        specs.performance.chipset.toLowerCase().includes('dimensity 9300')
      ));

    const prompt = `
You are a senior smartphone reviewer for a consumer tech buying guide.
Write an honest, no-fluff review for: **${phoneName}**

Use the following specifications as a reference:
${JSON.stringify(specs, null, 2)}

Before writing, first think through:
1. Who is the exact buyer for this phone? (skill level, budget, primary use case)
2. What are the 3-5 decision factors that actually matter for this phone (not every spec, only the ones that change the buying decision)
3. What are 2-3 real, currently-available alternatives in the same price bracket?

Then write the review exactly with this structure:

- [Introductory Verdict without a heading]
One line summarizing who should buy this and who should avoid it. No fluff. Do NOT use a heading for this.

- "## Who **${phoneName}** is actually for"
Be specific, not "great for everyone". e.g., "Mobile gamers on a budget" or "Photography enthusiasts who don't want to carry a DSLR".

- "## Key Strengths of **${phoneName}**"
Provide 3-5 concrete strengths with numbers where possible (battery hours, benchmark scores, camera sensor size, charging speeds, price-to-spec ratio). Use bullet points (using the - character).

- "## Honest Trade-offs of **${phoneName}**"
Provide 2-3 honest trade-offs or dealbreakers — do not write purely positive copy. Use bullet points (using the - character).

- "## Top Alternatives to **${phoneName}**"
A quick bulleted list of 2-3 alternatives, stating why someone might buy them instead. Use bullet points.

- "## How we evaluated **${phoneName}**"
A short paragraph explaining the criteria used to judge this phone.

- "## FAQs about **${phoneName}**" 
Generate a list of exactly 5 common questions and answers about this phone. Format them strictly as Q&A pairs (e.g. "Q: Does it support eSIM?\nA: Yes, it supports...").

- "## Pros & Cons of **${phoneName}**" (must be the final section)
Under the heading "## Pros & Cons of **${phoneName}**", list Pros (at least 4 bullet points starting with "+ ") and Cons (at least 3 bullet points starting with "- "). Do not mix them; write all Pros first, then all Cons.

Constraints:
- No generic filler phrases ("great choice for anyone," "packed with features").
- Every claim about performance needs a concrete number or comparison point based on the provided specs.
- Write for a reader who is considering this specific phone — they need to know if it's the right pick or if they should look elsewhere.
- Format the response using clean Markdown with level 2 (##) headings for each section.
- DO NOT use em dashes ("—") or other punctuation that makes the text look obviously AI-generated. The response must sound like natural human-written copy.
- DO NOT guess or hallucinate any information. All claims must be factually correct and strictly based on the provided specifications. If a spec is missing, do not invent it.
- DO NOT use dollar prices or any other currency. ALL pricing mentioned MUST be in Pakistani Rupees (PKR) only.
`;

    const rawText = await callPerplexity(
      "You are a senior smartphone reviewer for a consumer tech buying guide.",
      prompt
    );

    return rawText;
  } catch (error) {
    console.error("Error generating description from Perplexity:", error);
    return null;
  }
};

export const generateAIComparison = async (phones) => {
  if (!env.PERPLEXITY_API_KEY) {
    console.warn("Skipping AI comparison because API key is missing.");
    return null;
  }

  try {
    const phoneDetails = phones.map(p => ({
      name: p.name,
      slug: p.slug,
      specs: p.specs,
      price: p.prices?.[0]?.price_pkr
    }));

    const prompt = `
You are an expert mobile technology reviewer. Please provide a detailed and professional comparison between the following smartphones:
${JSON.stringify(phoneDetails, null, 2)}

Your task is to generate a comprehensive comparison output as a strict JSON object. Do not include markdown blocks like \`\`\`json. Return ONLY the raw valid JSON.

The required JSON schema is:
{
  "verdict": "Provide a very concise, punchy, and highly precise final verdict (maximum 2-3 sentences). Get straight to the point about which phone is better for whom. Maintain a premium, professional, and objective tone.",
  "key_differences": {
    "phone-slug-1": [
      "Advantage 1 (e.g., 'Shows 19% longer battery life (23:11 vs 19:28 hours)')",
      "Advantage 2 (e.g., 'Delivers 41% higher peak brightness (1100 against 781 nits)')"
    ],
    "phone-slug-2": [
      "Advantage 1",
      "Advantage 2"
    ]
  }
}

Guidelines for key_differences:
- For each phone, provide an array of 3-6 concise bullet points highlighting its strictly better advantages over the other phone(s).
- Use specific percentage differences and exact spec values where possible (e.g. 'Has 50% more RAM (6GB vs 4GB)').
- Only list factual advantages based on the specs provided.
- Ensure the keys in 'key_differences' perfectly match the 'slug' values provided in the phone details array.
- DO NOT use dollar prices or any other currency. ALL pricing mentioned MUST be in Pakistani Rupees (PKR) only.
`;

    const rawText = await callPerplexity(
      "You are an expert mobile technology reviewer.",
      prompt
    );

    if (!rawText) return null;

    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) return null;

    return JSON.parse(match[0]);
  } catch (error) {
    console.error("Error generating comparison from Perplexity:", error);
    return null;
  }
};

export const generatePhoneSEO = async (phoneData) => {
  if (!env.PERPLEXITY_API_KEY) {
    console.warn("Skipping AI SEO generation because API key is missing.");
    return null;
  }

  try {
    const currentYear = new Date().getFullYear();
    const prompt = `
You are an expert SEO specialist for mobile phones in Pakistan. Given the following phone data, generate highly optimized SEO fields.

Phone Name: ${phoneData.name}
Brand: ${phoneData.brand_slug}
Price PKR: ${phoneData.price_pkr || 'N/A'}
Specs: ${JSON.stringify(phoneData.specs, null, 2)}

Return a valid JSON object with the following schema exactly (no markdown formatting, just raw JSON). Ensure all arrays contain strings except for ai_faq which contains objects.

{
  "ai_seo_title": "Title in the exact format '${phoneData.name} Latest Price in Pakistan & Specs ${currentYear}'. Do NOT append the brand name 'Zozo'. Always end with the year ${currentYear}.",
  "ai_meta_description": "Compelling meta description (under 160 chars)",
  "ai_faq": [
    { "question": "Question 1", "answer": "Answer 1" },
    { "question": "Question 2", "answer": "Answer 2" },
    { "question": "Question 3", "answer": "Answer 3" },
    { "question": "Question 4", "answer": "Answer 4" },
    { "question": "Question 5", "answer": "Answer 5" }
  ],
  "ai_summary": "A 2-3 sentence summary of the phone",
  "ai_pros": ["Pro 1", "Pro 2", "Pro 3", "Pro 4", "Pro 5"],
  "ai_cons": ["Con 1", "Con 2", "Con 3", "Con 4", "Con 5"],
  "ai_buying_advice": "A short paragraph on who should buy this phone and if it's worth the price.",
  "ai_snippet": "A very short 1-sentence featured snippet highlighting the best feature.",
  "ai_suggested_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "ai_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}
`;

    const rawJSON = await callPerplexity(
      "You are an expert SEO specialist for mobile phones in Pakistan. Output only raw JSON.",
      prompt
    );

    if (!rawJSON) {
      console.error("AI response did not contain text.");
      throw new Error("Empty response from AI");
    }

    // Safely extract JSON between the first { and last }
    const match = rawJSON.match(/\{[\s\S]*\}/);
    if (!match) {
      console.error("Could not find JSON object in AI response:", rawJSON);
      throw new Error("Failed to parse JSON from AI response");
    }

    const jsonText = match[0];
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating SEO from Perplexity:", error);
    throw new Error(error.message || "Failed to generate AI SEO data");
  }
};

export const generatePhoneDataAdmin = async (phoneName) => {
  if (!env.PERPLEXITY_API_KEY) {
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
      "colors": "Titanium Black, Titanium Gray"
    }
  },
  "tags": ["gamers", "camera", "flagship"] // pick from: gamers, students, camera, battery, flagship, mid-range, budget (only those that strictly apply)
}
        `;

    const prompt = `
You are an expert mobile technology database architect and a meticulous, fact-checking researcher.
Your task is to produce a comprehensive JSON object containing the specifications for the smartphone: "${phoneName}".

RESEARCH METHOD (do this before answering):
- Perform live web search of AUTHORITATIVE sources ONLY: the official manufacturer spec page, GSMArena, Kimovil, and NanoReview.
- Treat the official manufacturer spec sheet and GSMArena as the source of truth. If sources disagree, use GSMArena.
- Cross-check every numeric spec (battery mAh, charging watts, height/width/thickness mm, weight g, refresh rate, peak brightness nits, camera MP/aperture) against GSMArena before writing it.

CRITICAL ACCURACY RULES (a wrong value is worse than a missing value):
- Base EVERY value strictly on what the live search results confirm. Do NOT rely on memory, assumptions, or "typical" values for the brand.
- If the search does not clearly confirm a value, set it to null (numbers/strings), false (booleans), or [] (arrays). NEVER guess, approximate, round loosely, or fabricate.
- Do not carry over specs from a different variant or a similarly named model. Confirm you are describing exactly "${phoneName}".
- For array checkbox fields (features, video_features, ai_features, network_features, sim_types), include ONLY values you can positively confirm apply to this exact phone.

COMPLETENESS:
- Within the accuracy rules above, fill as MANY fields as the sources confirm — including deep details: GPU/CPU clocks, RAM/storage type, Bluetooth/Wi-Fi/GPS, video recording modes, camera apertures & sensor sizes, body materials, IP rating, screen protection, fingerprint type, and benchmark scores when available.
- Do not leave a field null just to save effort — only leave it null when the sources genuinely do not confirm it.

OUTPUT FORMAT:
- Return ONLY the raw, valid JSON object. No markdown, no \`\`\`json fences, no commentary before or after.
- Match the exact structure below.

Here is the required schema:
${schemaString}
`;

    const result = await callPerplexity(
      "You are an expert mobile technology database architect and a meticulous, fact-checking researcher. You only state specs confirmed by live web search, and you use null rather than guessing. Return ONLY raw JSON without markdown.",
      prompt,
      { temperature: 0.1, searchContextSize: 'high', returnCitations: true }
    );

    const rawText = result?.content ?? null;
    if (!rawText) {
      console.error("AI response did not contain text.");
      return null;
    }

    if (result?.citations?.length || result?.searchResults?.length) {
      console.log(
        `[aiFillPhone] "${phoneName}" grounded on ${result.citations.length || result.searchResults.length} source(s).`
      );
    }

    let data = parseJsonObject(rawText);
    if (!data) {
      console.error("Could not parse JSON object from AI response:", rawText.slice(0, 500));
      return null;
    }

    // Guarantee that core specs are never silently missing: if any critical
    // field came back empty, run one targeted follow-up search to fill just those.
    data = await backfillCriticalSpecs(phoneName, data);

    return data;
  } catch (error) {
    console.error("Error generating data from Perplexity:", error);
    throw new Error(error.message || "Failed to generate AI Phone data");
  }
};

// The specs a phone listing must never be missing. Each entry is a dot-path
// into the returned object plus a human label used in the follow-up prompt.
const CRITICAL_SPECS = [
  { path: 'specs.display.size_inches', label: 'display size (inches)' },
  { path: 'specs.display.resolution', label: 'display resolution' },
  { path: 'specs.display.type', label: 'display panel type' },
  { path: 'specs.display.refresh_rate_hz', label: 'display refresh rate (Hz)' },
  { path: 'specs.performance.chipset', label: 'chipset / SoC' },
  { path: 'specs.performance.ram_options_gb', label: 'RAM options (GB)' },
  { path: 'specs.performance.storage_options_gb', label: 'storage options (GB)' },
  { path: 'specs.camera.rear_summary', label: 'rear camera summary' },
  { path: 'specs.camera.front_summary', label: 'front camera summary' },
  { path: 'specs.battery.capacity_mah', label: 'battery capacity (mAh)' },
  { path: 'specs.battery.charging_watts', label: 'wired charging (watts)' },
  { path: 'specs.body.weight_g', label: 'weight (g)' },
  { path: 'specs.connectivity.usb', label: 'USB type' },
  { path: 'specs.connectivity.bluetooth', label: 'Bluetooth version' },
  { path: 'specs.os', label: 'operating system' },
];

const getPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const setPath = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (acc[key] == null || typeof acc[key] !== 'object') acc[key] = {};
    return acc[key];
  }, obj);
  target[last] = value;
};

const isEmptyValue = (v) =>
  v == null || v === '' || (Array.isArray(v) && v.length === 0);

// Best-effort: re-query only the critical specs that came back empty, then merge.
// Never throws — if the follow-up fails, the original data is returned unchanged.
const backfillCriticalSpecs = async (phoneName, data) => {
  try {
    const missing = CRITICAL_SPECS.filter((s) => isEmptyValue(getPath(data, s.path)));
    if (missing.length === 0) return data;

    console.log(
      `[aiFillPhone] "${phoneName}" missing ${missing.length} core spec(s), running targeted backfill:`,
      missing.map((m) => m.label).join(', ')
    );

    const fieldList = missing.map((m) => `- "${m.path}": ${m.label}`).join('\n');
    const prompt = `
Using live web search of the official manufacturer spec page and GSMArena, find ONLY these specifications for the smartphone "${phoneName}":
${fieldList}

Return ONLY a raw JSON object whose keys are the exact dot-paths above and whose values are the confirmed specs.
- size/capacity/watts/weight/refresh rate must be numbers.
- RAM and storage options must be arrays of numbers in GB (e.g. [8, 12]).
- If a value cannot be confirmed from the sources, use null. NEVER guess or fabricate.

Example: { "specs.battery.capacity_mah": 5000, "specs.performance.ram_options_gb": [8, 12] }
`;

    const result = await callPerplexity(
      "You are a meticulous smartphone spec researcher. Only report specs confirmed by live web search; otherwise use null. Return ONLY raw JSON.",
      prompt,
      { temperature: 0.1, searchContextSize: 'high' }
    );

    const patch = parseJsonObject(result);
    if (!patch) return data;

    for (const { path } of missing) {
      const value = patch[path];
      if (!isEmptyValue(value)) setPath(data, path, value);
    }
    return data;
  } catch (error) {
    console.error(`[aiFillPhone] backfill failed for "${phoneName}":`, error.message);
    return data;
  }
};
