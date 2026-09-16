const test = require('node:test');
const assert = require('node:assert/strict');
const { CADManager } = require('../dist/managers/CADManager');

test('granular CAD endpoints preserve account IDs and explicit empty replacements', async () => {
  const client = Object.create(CADManager.prototype);
  const calls = [];
  client.executeCadV2Request = async (...args) => { calls.push(args); return { success: true, data: {} }; };
  await client.getPermissionCatalogV2();
  await client.getAccountPermissionsV2('account/uuid');
  await client.replaceAccountPermissionsV2('account-uuid', []);
  assert.deepEqual(calls, [
    ['GET', 'v2/general/permissions/catalog'],
    ['GET', 'v2/general/permissions/accounts/account%2Fuuid'],
    ['PUT', 'v2/general/permissions/accounts/account-uuid', { body: { version: 2, grants: [] } }],
  ]);
});

test('selected-field grants are forwarded unchanged without broadening access', async () => {
  const client = Object.create(CADManager.prototype);
  const calls = [];
  client.executeCadV2Request = async (...args) => { calls.push(args); return { success: true, data: {} }; };
  await client.replaceAccountPermissionsV2('account-uuid', ['record.4.read', 'record.4.edit.selected']);
  assert.deepEqual(calls[0][2].body, { version: 2, grants: ['record.4.read', 'record.4.edit.selected'] });
});
