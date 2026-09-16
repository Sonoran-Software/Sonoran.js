# Granular CAD permissions

The existing `setAccountPermissionsV2` remains the legacy boolean/category adapter. New integrations use these methods:

```js
const catalog = await api.cad.getPermissionCatalogV2();
// catalog.data: { version: 2, communityUuid, permissions, legacyGrants }
const account = await api.cad.getAccountPermissionsV2(accountUuid);
// account.data: { permissions: { version: 2, grants: [...] }, owner, migrated, status }
await api.cad.replaceAccountPermissionsV2(accountUuid, [
  'global.police', 'record.4.read', 'record.4.create',
]);
// An explicit empty array clears all grants:
await api.cad.replaceAccountPermissionsV2(accountUuid, []);
```

Use the actual community catalog; template IDs differ between communities. The catalog's `legacyGrants` maps uppercase legacy flags to current named grants using CAD's own migration rules. A read failure must not be treated as an empty grant set.

Routes:
- GET `/v2/general/permissions/catalog`
- GET `/v2/general/permissions/accounts/{accountUuid}`
- PUT `/v2/general/permissions/accounts/{accountUuid}`, body `{ version: 2, grants: [...] }`

The existing community API-key authentication applies. Unknown grants, owner edits, and edits to banned/removed/expired accounts are rejected. Nonempty grants make pending memberships Active, subject to the community member limit; empty grants make active memberships Pending.

These methods use the CAD v2 granular permissions API. Permission reads include the owner flag, migration state, and membership status. A granular replacement ends legacy category inheritance for future record templates; retrieve the catalog again when templates change.
