import test from 'node:test';
import assert from 'node:assert/strict';
import { unpinnedLists, appendPins } from './pinning.ts';

const lists = [{id:'first'}, {id:'second'}, {id:'third'}];
test('pin picker offers only lists not already on Home', () => {
  assert.deepEqual(unpinnedLists(lists, ['first']).map(list => list.id), ['second', 'third']);
  assert.deepEqual(unpinnedLists(lists, ['first','second','third']), []);
});
test('pinning preserves existing order and appends accessible selections once', () => {
  const pinned = ['third', 'first', 'gone'];
  const selected = ['second','first','second','missing'];
  assert.deepEqual(appendPins(lists, pinned, selected), ['third','first','second']);
  assert.deepEqual(pinned, ['third','first','gone']);
  assert.deepEqual(selected, ['second','first','second','missing']);
});
test('empty selection retains all accessible existing pins', () => {
  assert.deepEqual(appendPins(lists, ['first','third'], []), ['first','third']);
});
