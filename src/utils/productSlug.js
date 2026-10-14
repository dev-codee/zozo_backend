import { Phone } from '../models/Phone.model.js';
import { Earbud } from '../models/Earbud.model.js';
import { Vehicle } from '../models/Vehicle.model.js';

// Products share a root URL namespace with all public and application routes.
const RESERVED_PRODUCT_SLUGS = new Set([
    'admin', 'admin-login', 'api', 'brands', 'compare', 'comparisons', 'earbuds',
    'login', 'news', 'pages', 'phones', 'profile', 'search', 'site-map', 'vehicles',
    'sitemap', 'robots', 'favicon', 'icon', 'fonts', 'icons',
]);

// Ignore URL edits through both ordinary fields and MongoDB update operators.
export function preserveProductSlug(updateData) {
    delete updateData.slug;
    for (const [operator, changes] of Object.entries(updateData)) {
        if (!operator.startsWith('$') || !changes || typeof changes !== 'object') continue;
        for (const [field, value] of Object.entries(changes)) {
            if (field === 'slug' || field.startsWith('slug.') ||
                (operator === '$rename' && typeof value === 'string' &&
                    (value === 'slug' || value.startsWith('slug.')))) {
                delete changes[field];
            }
        }
        if (!Object.keys(changes).length) delete updateData[operator];
    }
}

export async function productSlugConflict(slug) {
    if (!slug || RESERVED_PRODUCT_SLUGS.has(slug) ||
        /-price(?:-in-.+)?$/.test(slug) || /-phone-price-.+$/.test(slug)) {
        return 'This product name conflicts with a website route; use a more specific name';
    }
    const matches = await Promise.all([
        Phone.exists({ slug }), Earbud.exists({ slug }), Vehicle.exists({ slug }),
    ]);
    if (matches.some(Boolean)) return 'A product with this URL already exists';
    return null;
}
