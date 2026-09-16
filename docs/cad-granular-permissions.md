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

### Full and selected-field editing

Discover support from `getPermissionCatalogV2()`: use `record.<templateId>.edit.selected` only when that exact grant is returned. It requires the updated CAD backend and may not yet be available during rollout. No SDK method or permission-document version change is required.

- `edit.own`: full editing of records owned by the account.
- `edit.any`: full editing of anyone's records, including the account's own records; field opt-in does not limit this grant on the updated backend.
- `edit.selected`: editing only fields marked **Allow limited editing** (`editableByOthers: true`) on another account's records. It does not include `edit.own` or `edit.any`.
- `supervise`: an additional requirement for supervisor-only fields; it does not grant editing by itself or bypass limited-field opt-in. Read-only fields remain locked for account editing.

Existing grants and field settings are preserved, and the new grant is not automatically assigned. For limited access, remove that template's `edit.any` grant from every source and assign `edit.selected` instead; optionally retain `edit.own`. Permissions from keys or role mappings may combine, and any remaining `edit.any` grants full editing. Fetch the account first and preserve unrelated grants when replacing its complete permission set. Never treat a failed read as an empty grant list. Community API-key record operations retain their existing service authority; these grants govern community accounts.
