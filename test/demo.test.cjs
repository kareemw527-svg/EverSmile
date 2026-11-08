const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const source = fs.readFileSync(require('node:path').join(__dirname, '../public/js/demo.js'), 'utf8');

function load(enabled, storage = new Map()) {
  const context = { window: { EVERSMILE_DEMO: enabled }, document: { addEventListener() {} }, Response, crypto: webcrypto, sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) } };
  vm.runInNewContext(source, context);
  return context.window.everSmileRequest;
}

test('Node application keeps its real API; demonstration is opt-in', () => {
  assert.equal(load(false), undefined);
});

test('demo booking, status, and deletion persist only in browser session storage', async () => {
  const storage = new Map();
  const request = load(true, storage);
  const created = await request('/api/appointments', { method: 'POST', body: JSON.stringify({ name: 'Test Person', service: 'Routine Cleaning' }) });
  assert.equal(created.status, 201);
  const record = await created.json();
  const update = await request(`/api/appointments/${record.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'Confirmed' }) });
  assert.equal((await update.json()).status, 'Confirmed');
  const reloaded = load(true, storage);
  assert.equal((await (await reloaded('/api/appointments')).json()).length, 3);
  assert.equal((await reloaded(`/api/appointments/${record.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await (await reloaded('/api/appointments')).json()).length, 2);
});
