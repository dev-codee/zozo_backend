import { Phone } from '../models/Phone.model.js';
import { generatePhoneDescription } from './ai.service.js';

export const getAllPhones = async (query) => {
    let filter = { approvalStatus: 'APPROVED' };

    // Handle budget / max_price filter
    if (query.max_price || query.min_price) {
        filter['prices.price_pkr'] = {};
        if (query.min_price) filter['prices.price_pkr'].$gte = Number(query.min_price);
        if (query.max_price) filter['prices.price_pkr'].$lte = Number(query.max_price);
    }

    // Handle brand filter (comma separated slugs)
    if (query.brand) {
        const brands = query.brand.split(',').map(b => b.trim());
        filter.brand_slug = { $in: brands };
    }

    if (query.ram) {
        const rams = query.ram.split(',').map(r => parseInt(r.trim(), 10)).filter(r => !isNaN(r));
        if (rams.length > 0) {
            filter['specs.performance.ram_options_gb'] = { $in: rams };
        }
    }

    if (query.processor) {
        const processors = query.processor.split(',').map(p => new RegExp(p.trim(), 'i'));
        filter['specs.performance.chipset'] = { $in: processors };
    }

    if (query.display) {
        const displays = query.display.split(',').map(d => new RegExp(d.trim(), 'i'));
        filter['specs.display.type'] = { $in: displays };
    }

    if (query.camera) {
        const minMpArray = query.camera.split(',').map(c => parseInt(c.match(/\d+/)?.[0], 10)).filter(n => !isNaN(n));
        if (minMpArray.length > 0) {
            const lowestMp = Math.min(...minMpArray);
            filter['specs.camera.rear'] = { $elemMatch: { megapixels: { $gte: lowestMp } } };
        }
    }

    if (query.network) {
        const networks = query.network.split(',').map(n => new RegExp(n.trim(), 'i'));
        filter['specs.connectivity.network'] = { $in: networks };
    }

    if (query.battery) {
        const minMahArray = query.battery.split(',').map(b => parseInt(b.match(/\d+/)?.[0], 10)).filter(n => !isNaN(n));
        if (minMahArray.length > 0) {
            const lowestMah = Math.min(...minMahArray);
            filter['specs.battery.capacity_mah'] = { $gte: lowestMah };
        }
    }

    if (query.video) {
        const videos = query.video.split(',').map(v => new RegExp(v.trim(), 'i'));
        filter['specs.camera.video_recording'] = { $in: videos };
    }

    if (query.category) {
        const categories = query.category.split(',').map(c => new RegExp(c.trim(), 'i'));
        filter['tags'] = { $in: categories };
    }

    if (query.status) {
        filter.status = query.status;
    }

    let sortQuery = {};
    if (query.sort === 'latest') {
        sortQuery = { release_date: -1 };
    } else if (query.sort === 'trending') {
        sortQuery = { updated_at: -1 };
    } else if (query.sort === 'price_asc') {
        sortQuery = { 'prices.price_pkr': 1 };
    } else if (query.sort === 'price_desc') {
        sortQuery = { 'prices.price_pkr': -1 };
    }

    let limit = 15;
    if (query.limit) {
        if (query.limit === 'all') {
            limit = 0; // 0 means no limit in mongoose
        } else {
            limit = parseInt(query.limit, 10) || 15;
        }
    }

    const page = parseInt(query.page, 10) || 1;
    const skip = limit > 0 ? (page - 1) * limit : 0;

    const total = await Phone.countDocuments(filter);
    const phones = await Phone.find(filter).sort(sortQuery).skip(skip).limit(limit);

    return {
        phones,
        pagination: {
            total,
            page,
            limit,
            totalPages: limit > 0 ? Math.ceil(total / limit) : 1
        }
    };
};


export const getPhoneBySlug = async (slug) => {
    // DB logic to fetch a single phone
    const phone = await Phone.findOne({ slug, approvalStatus: 'APPROVED' });
    return phone;
};

export const getPhoneDescription = async (slug) => {
    const phone = await Phone.findOne({ slug, approvalStatus: 'APPROVED' });
    if (!phone) return null;

    if (phone.description) {
        return phone.description;
    }

    const generatedDescription = await generatePhoneDescription(phone.name, phone.specs, phone.tags);
    if (generatedDescription) {
        phone.description = generatedDescription;
        await phone.save();
        return generatedDescription;
    }

    return null;
};

export const getPhonesByBrandSlug = async (brandSlug) => {
    return await Phone.find({ brand_slug: brandSlug, approvalStatus: 'APPROVED' });
};

export const getRelatedPhones = async (slug) => {
    const phone = await Phone.findOne({ slug, approvalStatus: 'APPROVED' });
    if (!phone) return null;

    const baseFilter = { slug: { $ne: slug }, approvalStatus: 'APPROVED' };

    // Related by Processor
    let byProcessor = [];
    const chipset = phone.specs?.performance?.chipset;
    if (chipset) {
        // Extract the main part of the chipset (e.g. "Snapdragon 8 Gen 3" from "Qualcomm Snapdragon 8 Gen 3")
        let chipsetMatch = chipset;
        if (chipset.includes('Snapdragon')) {
            const match = chipset.match(/(Snapdragon[^(\n]+)/);
            if (match) chipsetMatch = match[1].trim();
        } else if (chipset.includes('Apple')) {
            const match = chipset.match(/(Apple[^(\n]+)/);
            if (match) chipsetMatch = match[1].trim();
        } else if (chipset.includes('Dimensity')) {
            const match = chipset.match(/(Dimensity[^(\n]+)/);
            if (match) chipsetMatch = match[1].trim();
        }

        byProcessor = await Phone.find({
            ...baseFilter,
            'specs.performance.chipset': new RegExp(chipsetMatch, 'i')
        }).limit(5);
    }

    // Related by Network (5G vs 4G)
    let byNetwork = [];
    const network = phone.specs?.connectivity?.network || "";
    let networkMatch = "";
    if (network.includes("5G")) networkMatch = "5G";
    else if (network.includes("4G") || network.includes("LTE")) networkMatch = "4G";
    
    if (networkMatch) {
        byNetwork = await Phone.find({
            ...baseFilter,
            'specs.connectivity.network': new RegExp(networkMatch, 'i')
        }).limit(5);
    }

    return {
        by_processor: byProcessor,
        by_network: byNetwork,
        comparisons: [], // To be implemented when Comparison system is built
        blogs: [] // To be implemented when Blog system is built
    };
};
