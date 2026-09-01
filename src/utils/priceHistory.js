// Shared helper for maintaining a product's `price_history` array.
//
// Price changes are infrequent (admin edits), so we keep the history embedded on
// the product document as a small append-only list of { date, price_pkr, source }
// points. The read side (product detail page) already fetches the document, so no
// extra query is needed to draw the price-history graph.

const MAX_POINTS = 60; // cap growth — keep the most recent ~60 changes

const toNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
};

/**
 * Return the next price_history array after a price change.
 *
 * The client value is never trusted — history is always recomputed from the
 * previously stored document so it cannot be tampered with or wiped.
 *
 * @param {Array} prevHistory  existing history from the stored document
 * @param {number} prevPrice   previous headline price (price_pkr)
 * @param {number} newPrice    incoming headline price (price_pkr)
 * @param {object} [opts]
 * @param {string} [opts.source='manual']  who/what changed the price
 * @param {Date}   [opts.prevDate]         when the previous price took effect
 * @returns {Array|null} the new history array, or null if nothing should change
 */
export const buildPriceHistory = (prevHistory, prevPrice, newPrice, opts = {}) => {
    const { source = 'manual', prevDate } = opts;
    const history = Array.isArray(prevHistory) ? [...prevHistory] : [];

    const nNew = toNumber(newPrice);
    if (!Number.isFinite(nNew) || nNew <= 0) return null; // no valid new price to record

    const nOld = toNumber(prevPrice);
    if (Number.isFinite(nOld) && nOld === nNew) return null; // unchanged — nothing to record

    // Seed a baseline point with the previous price so the very first change
    // still produces a 2-point (drawable) graph. Dated to when the old price was
    // last effective, not "now", so the two points don't collapse onto one x.
    if (history.length === 0 && Number.isFinite(nOld) && nOld > 0) {
        history.push({ price_pkr: nOld, date: prevDate || new Date(), source: 'baseline' });
    }

    history.push({ price_pkr: nNew, date: new Date(), source });
    return history.slice(-MAX_POINTS);
};

/**
 * Initial history entry for a newly created product that already has a price.
 * @returns {Array} a one-element history, or [] when there is no valid price
 */
export const seedPriceHistory = (price, source = 'initial') => {
    const n = toNumber(price);
    if (!Number.isFinite(n) || n <= 0) return [];
    return [{ price_pkr: n, date: new Date(), source }];
};
