import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchLedger,
  loginJunior,
  submitThankYou,
  type StorageLike,
} from './thankYouClient';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  };
}

function createHtmlFallbackFetch(status = 200) {
  return async () =>
    new Response('<!doctype html><html><body>SPA fallback</body></html>', {
      status,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

test('Netlify HTML SPA fallback never throws Unexpected token < and persists locally', async () => {
  const storage = createMemoryStorage();
  const netlifyFetch = createHtmlFallbackFetch(200);

  const loginRes = await loginJunior('Riya Sharma', netlifyFetch, storage);
  assert.equal(loginRes.currentRecord?.name, 'Riya Sharma');
  assert.equal(loginRes.currentRecord?.status, 'Pending');
  assert.equal(loginRes.currentRecord?.hits, 0);

  const hitRes = await submitThankYou('Riya Sharma', netlifyFetch, storage);
  assert.equal(hitRes.currentRecord?.status, 'Thanked');
  assert.equal(hitRes.currentRecord?.hits, 1);

  const ledgerRes = await fetchLedger('Riya Sharma', netlifyFetch, storage);
  assert.equal(ledgerRes.currentRecord?.hits, 1);
  assert.ok(ledgerRes.totalHits >= 5);
});

test('Netlify 404 HTML page also falls back cleanly without JSON syntax error', async () => {
  const storage = createMemoryStorage();
  const netlify404Fetch = createHtmlFallbackFetch(404);

  const hitRes = await submitThankYou('Kabir Mehta', netlify404Fetch, storage);
  assert.equal(hitRes.currentRecord?.name, 'Kabir Mehta');
  assert.equal(hitRes.currentRecord?.hits, 1);
});

test('Real backend JSON validation error is still surfaced to the UI', async () => {
  const storage = createMemoryStorage();
  const validationErrorFetch = async () =>
    new Response(JSON.stringify({ error: 'Name is invalid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  await assert.rejects(
    () => loginJunior('', validationErrorFetch, storage),
    /Name is invalid/
  );
});
