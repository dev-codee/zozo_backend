import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSnapshot, getExchangeRates } from '../src/services/exchangeRates.service.js';
import { pricedList, priceExpression } from '../src/services/pricing.service.js';
import { Phone } from '../src/models/Phone.model.js';
import { Earbud } from '../src/models/Earbud.model.js';
import { Vehicle } from '../src/models/Vehicle.model.js';
const now = Date.now();
const snapshot = { result: 'success', base_code: 'USD', time_last_update_unix: Math.floor(now / 1000), rates: { USD: 1, PKR: 280, AED: 3.67, BAD: -1 } };
test('validate rates and reject stale, future or invalid upstream data', () => {
  assert.equal(validateSnapshot(snapshot).rates.BAD, undefined);
  assert.equal(validateSnapshot(snapshot).rates.PKR, 280);
  assert.throws(() => validateSnapshot({ ...snapshot, base_code: 'EUR' }));
  assert.throws(() => validateSnapshot({ ...snapshot, time_last_update_unix: 1 }));
  assert.throws(() => validateSnapshot({ ...snapshot, time_last_update_unix: (now + 86400000) / 1000 }));
  assert.throws(() => validateSnapshot({ ...snapshot, rates: { USD: 1 } }));
});
test('all models accept USD references and reject negative prices', () => {
  for (const Model of [Phone, Earbud, Vehicle]) {
    const doc = new Model({ name: 'Test', slug: 'test', brand_slug: 'test', price_usd: 500 });
    assert.equal(doc.price_usd, 500);
    doc.price_usd = -1;
    assert.ok(doc.validateSync().errors.price_usd);
  }
});
test('one refresh serves concurrent requests; filtered pagination uses effective prices', async () => {
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { calls++; return { ok: true, json: async () => snapshot }; };
  try {
    const results = await Promise.all([getExchangeRates(), getExchangeRates(), getExchangeRates()]);
    assert.equal(calls, 1);
    assert.equal(results[0].rates.PKR, 280);
    let pipeline;
    const Model = { aggregate: async value => { pipeline = value; return [{ items: [{ name: 'test' }], count: [{ total: 3 }] }]; } };
    const result = await pricedList(Model, { approvalStatus: 'APPROVED', price_pkr: { $lte: 140000 } }, { name: 1, images: { $slice: 1 } }, { price_pkr: 1, _id: 1 }, 0, 15, { display_currency: 'PKR' });
    assert.equal(result.total, 3);
    assert.deepEqual(pipeline[1].$set._effectivePrice, priceExpression('PKR', 280));
    assert.deepEqual(pipeline[2].$match, { _effectivePrice: { $ne: null, $lte: 140000 } });
    assert.equal(pipeline.at(-1).$facet.items[0].$sort._sortPrice, 1);
    assert.equal(pipeline.at(-1).$facet.items[0].$sort._missingPrice, 1);
    await assert.rejects(() => pricedList(Model, { price_pkr: { $lte: NaN } }, {}, {}, 0, 15, {}), /Invalid price/);
  } finally { globalThis.fetch = original; }
});
test('outages retain last-good rates, throttle retries and expire old snapshots', async () => {
    const service = await import('../src/services/exchangeRates.service.js?outage-test');
    const originalFetch = globalThis.fetch;
    const originalNow = Date.now;
    let clock = now;
    let calls = 0;
    Date.now = () => clock;
    globalThis.fetch = async () => { calls++; if (calls > 1) throw new Error('Test upstream outage'); return { ok: true, json: async () => snapshot }; };
    try {
        assert.equal((await service.getExchangeRates()).rates.PKR, 280);
        clock += 2 * 86400000;
        const stale = await service.getExchangeRates();
        assert.equal(stale.stale, true);
        assert.equal(stale.rates.PKR, 280);
        await service.getExchangeRates();
        assert.equal(calls, 2);
        clock += 6 * 86400000;
        assert.deepEqual((await service.getExchangeRates()).rates, { USD: 1 });
    } finally { globalThis.fetch = originalFetch; Date.now = originalNow; }
});
test('admin USD source survives serialization and reference can be cleared independently', () => {
    for (const Model of [Phone, Earbud, Vehicle]) {
        const doc = new Model({ name: 'Test', slug: 'test', brand_slug: 'test', price_usd: 499.99, price_usd_source: 'https://example.com/source', price_pkr: 155000 });
        const reopened = new Model(doc.toObject());
        assert.equal(reopened.price_usd_source, 'https://example.com/source');
        reopened.price_usd = null;
        reopened.price_usd_source = '';
        assert.equal(reopened.price_usd, null);
        assert.equal(reopened.price_pkr, 155000);
    }
});
