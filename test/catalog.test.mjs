import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {business} from '../src/data.mjs';
import {createCustomerService} from '../customer-area/src/service.mjs';

const sql = fs.readFileSync(new URL('../customer-area/migrations/001_accounts_orders.sql', import.meta.url), 'utf8');

test('the order catalogue matches the published packs', () => {
  const inserted = sql.match(/INSERT INTO public\.beatriz_packs VALUES ([^;]+);/);
  assert.ok(inserted, 'beatriz_packs insert is missing');
  const pairs = [...inserted[1].matchAll(/\((\d+)\s*,\s*(\d+(?:\.\d+)?)\)/g)].map((match) => [Number(match[1]), Number(match[2])]);
  assert.deepEqual(pairs, business.packs.map((pack) => [pack.pieces, pack.price]));
});

function clientRecordingOrders() {
  const calls = [];
  const client = {
    auth: {getSession: async () => ({data: {user: {id: 'customer-1'}}, error: null})},
    rpc: async (name, args) => {
      calls.push({name, args});
      return {data: {id: args.request_id, pieces: args.pack_pieces, price: 69, notes: args.customer_notes}, error: null};
    },
  };
  return {calls, service: createCustomerService(client)};
}

test('a customer can submit only a published pack', async () => {
  const {calls, service} = clientRecordingOrders();
  const order = await service.submit({pieces: '60', notes: 'Manhã', requestId: '11111111-1111-4111-8111-111111111111'});
  assert.equal(order.pieces, 60);
  assert.deepEqual(calls[0].args, {
    pack_pieces: 60,
    customer_notes: 'Manhã',
    request_id: '11111111-1111-4111-8111-111111111111',
  });
});

test('the discontinued 100-piece pack is rejected before it is stored', async () => {
  const {calls, service} = clientRecordingOrders();
  await assert.rejects(() => service.submit({pieces: 100, requestId: '22222222-2222-4222-8222-222222222222'}), /packs mensais/);
  assert.equal(calls.length, 0);
});
