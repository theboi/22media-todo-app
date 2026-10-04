import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCredentials } from './credentials.ts';
const credentials = {email:'person@example.com',password:'password12',confirmation:'password12'};
test('registration accepts matching credentials and preserves password whitespace', () => {
  assert.equal(validateCredentials(credentials, true), undefined);
  assert.equal(validateCredentials({...credentials,password:' password12 ',confirmation:' password12 '}, true), undefined);
});
test('submission explains missing or invalid email and password requirements', () => {
  assert.match(validateCredentials({...credentials,email:''}, true), /email/i);
  assert.match(validateCredentials({...credentials,email:'person'}, true), /valid email/i);
  assert.match(validateCredentials({...credentials,password:'short'}, true), /8 characters/i);
  assert.match(validateCredentials({...credentials,password:'a'.repeat(129)}, true), /128 characters/i);
});
test('registration explains missing and mismatched confirmation; sign in needs no confirmation', () => {
  assert.match(validateCredentials({...credentials,confirmation:''}, true), /confirm/i);
  assert.match(validateCredentials({...credentials,confirmation:'different'}, true), /match/i);
  assert.equal(validateCredentials({...credentials,confirmation:''}, false), undefined);
});
