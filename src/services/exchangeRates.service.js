import mongoose from 'mongoose';

const DAY = 86_400_000;
const Snapshot = mongoose.models.ExchangeRateSnapshot || mongoose.model('ExchangeRateSnapshot', new mongoose.Schema({
    _id: String, rates: { type: Map, of: Number }, updatedAt: Date,
}, { versionKey: false }));
let cached;
let pending;
let retryAfter = 0;

export function validateSnapshot(data, now = Date.now()) {
    const timestamp = Number(data.time_last_update_unix) * 1000;
    if (data.result !== 'success' || data.base_code !== 'USD' || !Number.isFinite(timestamp) || timestamp > now + 300_000 || now - timestamp > 7 * DAY) throw new Error('Invalid exchange-rate snapshot');
    const rates = Object.fromEntries(Object.entries(data.rates || {}).filter(([code, rate]) => /^[A-Z]{3}$/.test(code) && typeof rate === 'number' && Number.isFinite(rate) && rate > 0));
    if (rates.USD !== 1 || !rates.PKR) throw new Error('Missing USD/PKR exchange rates');
    return { rates, updatedAt: new Date(timestamp).toISOString() };
}

// Persist the last good snapshot across restarts; coalesce concurrent refreshes.
// Never manufacture a rate when the upstream service is unavailable.
export async function getExchangeRates() {
    if (cached && Date.now() - Date.parse(cached.updatedAt) < DAY) return { ...cached, stale: false };
    if (pending) return pending;
    pending = (async () => {
        if (!cached && mongoose.connection.readyState === 1) {
            const saved = await Snapshot.findById('USD').lean();
            if (saved) cached = { rates: { ...saved.rates }, updatedAt: new Date(saved.updatedAt).toISOString() };
        }
        if ((!cached || Date.now() - Date.parse(cached.updatedAt) >= DAY) && Date.now() >= retryAfter) {
            try {
                const response = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(6000) });
                if (!response.ok) throw new Error(`Exchange rates HTTP ${response.status}`);
                cached = validateSnapshot(await response.json());
                if (mongoose.connection.readyState === 1) {
                    await Snapshot.findByIdAndUpdate('USD', cached, { upsert: true }).catch(error => console.error('Could not persist exchange rates:', error.message));
                }
            } catch (error) {
                retryAfter = Date.now() + 15 * 60_000;
                console.error('Exchange rates unavailable:', error.message);
            }
        }
        if (!cached || Date.now() - Date.parse(cached.updatedAt) > 7 * DAY) return { rates: { USD: 1 }, updatedAt: null, stale: true };
        return { ...cached, stale: Date.now() - Date.parse(cached.updatedAt) >= 2 * DAY };
    })().finally(() => { pending = undefined; });
    return pending;
}
