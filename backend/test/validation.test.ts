import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidItemId, validateNoteInput, validateProgressInput } from '../src/validation.js';

test('accepts safe resource ids and rejects path/query syntax', () => {
  assert.equal(isValidItemId('soc-intro.module-1'), true);
  assert.equal(isValidItemId('path:module_2'), true);
  assert.equal(isValidItemId('../admin'), false);
  assert.equal(isValidItemId('x?delete=true'), false);
  assert.equal(isValidItemId(''), false);
});

test('validates progress and normalizes completed progress to 100 percent', () => {
  assert.deepEqual(validateProgressInput({ status: 'in_progress', percent: 40 }), {
    ok: true, value: { status: 'in_progress', percent: 40, metadata: {} },
  });
  assert.deepEqual(validateProgressInput({ status: 'completed', percent: 20 }), {
    ok: true, value: { status: 'completed', percent: 100, metadata: {} },
  });
});

test('rejects invalid ranges, unknown keys and excessive metadata', () => {
  assert.equal(validateProgressInput({ status: 'in_progress', percent: 101 }).ok, false);
  assert.equal(validateProgressInput({ status: 'completed', percent: 100, user_id: 'victim' }).ok, false);
  assert.equal(validateProgressInput({ status: 'in_progress', percent: 5, metadata: { blob: 'x'.repeat(17_000) } }).ok, false);
});

test('validates note inputs and length limits', () => {
  assert.deepEqual(validateNoteInput({ title: ' My note ', content: 'notes' }), {
    ok: true, value: { title: 'My note', content: 'notes' },
  });
  assert.equal(validateNoteInput({ title: ' ', content: '' }).ok, false);
  assert.equal(validateNoteInput({ title: 'Good', content: 'ok', user_id: 'another-user' }).ok, false);
});
