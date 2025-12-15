# Sonoran.js
Sonoran.js is a library that allows you to interact with the [Sonoran CAD](https://docs.sonoransoftware.com/cad), [Sonoran Radio](https://docs.sonoransoftware.com/radio), and [Sonoran CMS](https://docs.sonoransoftware.com/cms) API. Based off of and utilizes several Discord.js library techniques for ease of use.

## Installation
```js
npm i @sonoransoftware/sonoran.js
```

## Example Instance Setup

Utilizing Sonoran CMS, Sonoran CAD & Sonoran Radio
```js
const Sonoran = require('sonoran.js');
const instance = Sonoran.instance({
  cadCommunityId: 'mycommunity',
  cadApiKey: 'DF58F1E-FD8A-44C5-BA',
  cmsCommunityId: 'mycommunity',
  cmsApiKey: 'e6ba9d68-ca7a-4e59-a9e2-93e275b4e0bf'
  radioCommunityId: 'mycommunity'
  radioApiKey: 'e6ba9d68-ca7a-4e59-a9e2-93e275b4e0bf'
});
```

Utilizing just Sonoran CMS or Sonoran CAD
```js
const Sonoran = require('sonoran.js');
const instance = Sonoran.instance({
  communityId: 'mycommunity',
  apiKey: 'e6ba9d68-ca7a-4e59-a9e2-93e275b4e0bf',
  product: Sonoran.productEnums.CMS
});
```

## Example Method Usage
```js
const Sonoran = require('sonoran.js');
const instance = Sonoran.instance({
  communityId: 'mycommunity',
  apiKey: 'e6ba9d68-ca7a-4e59-a9e2-93e275b4e0bf',
  product: Sonoran.productEnums.CMS,
  serverId: 2 // Optional - The default server id for both CAD & CMS is 1
});

// This will verify the whitelist of the given API ID or account ID for server id 2 as specified above
instance.cms.verifyWhitelist('459798465498798432');
// OR
// This will verify the whitelist of the given API ID for server id 1 since I specified that
instance.cms.verifyWhitelist({
  apiId: '459798465498798432',
  serverId: 1
});
// OR
// This will verify the whitelist of the given account ID for server id 1 since I specified that
instance.cms.verifyWhitelist({
  accId: 'd5663516-ee35-11e9-9714-5600023b2434',
  serverId: 1
});
```

## CAD Functions
Most CAD manager helpers return a `CADStandardResponse<T>` of `{ success, data?, reason? }`. Legacy helpers (`getAccount`, `setClockTime`, `joinCommunity`, `leaveCommunity`) keep their original response shapes.

### Account & Configuration
- **`getVersion()`** - resolves to the numeric CAD subscription level.
- **`getAccount({ apiId?, username? })`** - fetches account details.
- **`setClockTime({ serverId, currentUtc, currentGame, secondsPerHour })`** - synchronizes in-game time.
- **`joinCommunity(internalKey, accounts)`** / **`leaveCommunity(internalKey, accounts)`** - manages community membership (requires an internal key).
- **`setPenalCodes(codes)`** - replaces the penal code configuration.
- **`setAccountApiIds(data)`** - assigns API IDs to a username.
- **`checkApiId(apiId)`** - confirms whether an API ID exists.
- **`applyPermissionKey(apiId?, permissionKey)`** - applies a permission key to an account.
- **`setAccountPermissions(changes)`** - bulk add/remove CAD permissions.
- **`banUser(data)`** - kicks or bans an account via the CAD API.
- **`verifySecret(secret)`** - validates a configured secret.
- **`authorizeStreetSigns(serverId)`** - authorizes map street-sign updates.
- **`setPostals(entries)`** - overwrites the postal table.
- **`sendPhoto(apiId?, url)`** - attaches a photo to an account.

```js
const account = await instance.cad.getAccount({ apiId: '1234567890' });
const penalCodes = await instance.cad.setPenalCodes([
  { code: '1A', type: 'Felony', title: 'Example', bondType: 'None', jailTime: '0', bondAmount: 0 }
]);
await instance.cad.setAccountApiIds({ username: 'SomeUser', apiIds: ['1234567890'], pushNew: true });
const permissionUpdate = await instance.cad.setAccountPermissions({ apiId: '1234567890', add: ['admin'], remove: [] });
```

### Records & Lookups
- **`getRecordTemplates(recordTypeId?)`**
- **`createRecord(data)`** / **`updateRecord(data)`** / **`removeRecord(id)`**
- **`lookupByInt(criteria)`** - identifier-based lookup.
- **`lookupRecords(query)`** - plate/name-based lookup.

```js
await instance.cad.createRecord({ user: '1234567890', useDictionary: true, recordTypeId: 2, replaceValues: { NAME: 'Jane Doe' } });
const lookup = await instance.cad.lookupRecords({ apiId: '1234567890', types: [2], first: 'Jane', last: 'Doe', mi: '', plate: '', partial: false });
```

### Civilian Tools
- **`getCharacters(apiId)`** - lists civilian characters for an API ID.
- **`createCharacter(data)`** / **`updateCharacter(data)`** / **`removeCharacter(id)`** - CRUD helpers for civilian profiles.

### Identifiers & Units
- **`getIdentifiers(apiId)`**
- **`modifyIdentifier(change)`** / **`setIdentifier(apiId?, identId)`**
- **`setUnitPanic(apiId?, isPanic)`** / **`setUnitStatus(apiId?, status, serverId)`**
- **`getActiveUnits(options)`** - direct CAD fetch for active units.
- **`kickUnit(apiId?, reason, serverId)`**
- **`updateUnitLocations(locations)`**

### Map & Streetsigns
- **`getBlips(serverId)`**
- **`addBlips(blips)`** / **`updateBlips(blips)`** / **`removeBlip(id)`**
- **`setStreetSignConfig(serverId, signConfig)`**
- **`updateStreetSign(serverId, signData)`**

### Calls & Dispatch
- **`create911Call(details)`** / **`remove911Call(callId)`**
- **`getCalls(options)`**
- **`createDispatch(data)`**
- **`attachUnits(serverId, callId, units)`** / **`detachUnits(serverId, units)`**
- **`setCallPostal(serverId, callId, postal)`** / **`setCallPrimary(serverId, callId, primary, trackPrimary)`**
- **`addCallNote(serverId, callId, note)`**
- **`closeCall(serverId, callId)`**

```js
const dispatch = await instance.cad.createDispatch({
  serverId: 1,
  origin: Sonoran.CADDispatchOriginEnums.Caller,
  status: Sonoran.CADDispatchStatusEnums.Active,
  priority: 1,
  block: '123',
  address: 'Main St',
  postal: '100',
  title: 'Traffic Stop',
  code: 'TS',
  primary: 42,
  trackPrimary: true,
  description: 'Blue sedan headed north',
  metaData: {},
  units: ['unit-1']
});
await instance.cad.attachUnits(1, 1001, ['unit-2']);
```

## CAD Server Functions
- **`getServers()`** - fetches configured CAD servers.
- **`setServers(servers, deployMap?)`** - updates server configuration and refreshes the cache.

```js
const servers = await instance.cad.servers?.getServers();
await instance.cad.servers?.setServers(servers ?? [], false);
```

## CAD Active Unit Functions
`CADActiveUnitsManager#getActiveUnits(options?)` proxies the CAD endpoint and returns a `CADStandardResponse`.

```js
const activeUnits = await cadActiveUnitsManager.getActiveUnits({ includeOffline: true, limit: 25 });
if (activeUnits.success) {
  console.log(activeUnits.data);
}
```

## CMS Functions
### getSubscriptionVersion()
Returns the community's CMS subscription version.
```js
const version = await instance.cms.getSubscriptionVersion();
```

### verifyWhitelist(obj)
Verifies that a user is whitelisted in the specified server.
#### Arugment `params`
##### Type `object` `{accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: number, serverId?: number}`
##### Type `string` (Account UUID or API ID as a string)
*Note: If passing a `string` for data (Account UUID or API ID) the `serverId` will default to `1`*
```js
const params = {
 accId: '',
 apiId: '',
 username: '',
 discord: '',
 uniqueId: 1234,
 serverId: 1
};
// Check if user with Unique ID 1234 is whitelisted on Server ID 1
const isWhitelisted = await instance.cms.verifyWhitelist(params);
```

### getFullWhitelist()
Returns a full list of whitelisted users in the specified server.
#### Arugment `serverId`
##### Type `number` `1`
```js
// Get the full whitelist for server ID 1
const fullWhitelist = await instance.cms.getFullWhitelist(1);
```

### getComAccount(obj)
Returns the user's account object
#### Arugment `params`
##### Type `object` `{accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: string}`
```js
const params = {
 accId: '',
 apiId: '',
 username: '',
 discord: '',
 uniqueId: '1234',
};
// Get a user's account as an object
const getAccount = await instance.cms.getComAccount(params);
```

### getAccountRanks(obj)
Returns a user account's ranks
#### Arugment `params`
##### Type `object` `{accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: string}`
```js
const params = {
 accId: '',
 apiId: '',
 username: '',
 discord: '',
 uniqueId: '1234',
};
// Get a user's ranks
const getRanks = await instance.cms.getAccountRanks(params);
```

### clockInOut(obj)
Clock a user in or out in the CMS system
#### Arugment `obj`
##### Type `object` `{accId?: string, apiId?: string, forceClockIn?: boolean, discord?: string, uniqueId?: string, type?: string}`
```js
const params = {
 accId: '',
 apiId: '',
 forceClockIn: true,
 discord: '',
 uniqueId: '1234',
 type: 'clockin-type-uuid'
};
// Clocks a user in or out
const clock = await instance.cms.clockInOut(params);
```

### getClockInTypes()
Returns the configured clock-in types.
```js
const types = await instance.cms.getClockInTypes();
// [{ id: 'uuid', label: 'Patrol' }]
```

### checkComApiId(apiId)
Checks if a given API ID is attatched to any account within the community, and if true, returns the username of the associated account.
#### Arugment `apiId`
##### Type `string` `1234`
```js
// Checks if API ID is attatched to a user, returns username if true
const apiIdUsername = await instance.cms.checkComApiId('1234');
```

### getDepartments()
Gets all department information for a CMS community
```js
// Gets department information for community
const getDepts = await instance.cms.getDepartments();
```

### setAccountRanks(obj, apiId, accId, username, discord, uniqueId)
Updates the CMS account's ranks using the identifiers provided.
#### Arugment `params`
##### Type `object` `{set?: string[]; add?: string[]; remove?: string[]}`
#### Arguments `apiId`, `accId`, `username`, `discord`, `uniqueId`
##### Type `string` or `undefined`
*Note: Only one identifier is required (Discord, accID, etc.) pass in undefined for variables you are not searching by*
```js
const params = {
 set: ['9ad00ded-93d1-422e-8470-d2515f02652c'],
 add: undefined,
 remove: undefined
};
// Wipe users existing ranks, and set ones provided
// Add and Remove are undefined as we don't want to call them here
// Sets account ranks by the discord ID parameter
const setRanks = await instance.cms.setAccountRanks(params, undefined, undefined, undefined, '12345678', undefined);
```

### setAccountName(apiId, username, accId, discord, uniqueId, newName)
Sets the display name used in CMS for an account.
```js
await instance.cms.setAccountName(undefined, undefined, 'account-uuid', undefined, undefined, 'New Display Name');
```

### cmsBanAccount(params)
Adds a ban flag to the targeted account.
```js
await instance.cms.cmsBanAccount({ apiId: '1234' });
```

### cmsKickAccount(params)
Performs a CMS kick request for the targeted account.
```js
await instance.cms.cmsKickAccount({ discord: '1234567890' });
```

### forceSync(params)
Manually triggers a CMS force-sync for the targeted identifiers.
```js
await instance.cms.forceSync({ username: 'SomeUser' });
```

### getPromotionFlows()
Fetches the configured promotion flows.
```js
const flows = await instance.cms.getPromotionFlows();
```

### triggerPromotionFlows(flows)
Executes promotion or demotion flows for one or more users.
```js
await instance.cms.triggerPromotionFlows([{
  userId: 'u-123',
  flowId: 'flow-abc',
  users: ['u-123', 'u-456'],
  promote: true
}]);
```

### getCurrentClockIn(params)
Fetches the current clock-in entry for the account if one exists.
```js
const currentEntry = await instance.cms.getCurrentClockIn({ apiId: '1234' });
```

### getLatestActivity(params)
Gets the latest clock-in or activity entries for an account.
```js
// Clock-in history
const clockins = await instance.cms.getLatestActivity({ accId: 'account-uuid', type: 'clockin' });
// Activity history (requires serverId)
const activity = await instance.cms.getLatestActivity({ accId: 'account-uuid', type: 'activity', serverId: 1 });
```
*Returns an array of clock-in logs (`AccountClockInLog`) or activity logs (`AccountActivityLog`); each item includes `objKey` alongside the other fields.*

### getAccounts(options)
Retrieves CMS accounts with optional pagination and status filters.
```js
const accounts = await instance.cms.getAccounts({ take: 50, banned: false });
```

### getProfileFields()
Returns profile field definitions configured for the community.
```js
const profileFields = await instance.cms.getProfileFields();
```

### rsvp(eventId, params)
Toggles RSVP for an event for the provided account identifiers.
```js
await instance.cms.rsvp('event-id', { accId: 'account-uuid' });
```

### getFormSubmissions(templateId, options)
Retrieves form submissions with optional pagination.
```js
const submissions = await instance.cms.getFormSubmissions(42, { skip: 0, take: 25 });
```

### changeFormStage(params)
Moves a form to the specified stage for an account.
```js
await instance.cms.changeFormStage({
  formId: 42,
  newStageId: 'approved',
  accId: 'account-uuid',
  uniqueId: 1234
});
```

### editAccountProfileFields(params)
Updates profile fields for an account.
```js
await instance.cms.editAccountProfileFields({
  accId: 'account-uuid',
  profileFields: [
    { fieldId: 10, value: 'Value' }
  ]
});
```

### erlcGetOnlinePlayers(robloxJoinCode)
Returns the current ERLC player list for the join code.
```js
const players = await instance.cms.erlcGetOnlinePlayers('join-code');
```

### erlcGetPlayerQueue(robloxJoinCode)
Returns the current ERLC player queue count for the join code.
```js
const queue = await instance.cms.erlcGetPlayerQueue('join-code');
```

### erlcAddNewRecord(data)
Adds a moderation record for a player in ERLC.
```js
await instance.cms.erlcAddNewRecord({
  robloxJoinCode: 'join-code',
  executerDiscordId: '1234567890',
  type: 'Warning',
  reason: 'Reckless driving'
});
```

## CMS Server Functions
### getGameServers()
Fetches the configured CMS game servers. Returns an array of server objects.
```js
const cmsServers = await instance.cms.servers?.getGameServers();
```

### setGameServers(servers)
Replaces the configured CMS game servers and refreshes the cache with the response payload.
```js
await instance.cms.servers?.setGameServers([
  { name: 'Server 1', description: 'Primary server', allowedRanks: ['admin'] }
]);
```

## Radio Functions
### getCommunityChannels()
Retrieves configured community channel groups and channels.
```js
const channels = await instance.radio.getCommunityChannels();
```

### getConnectedUsers()
Lists all connected radio users in the community.
```js
const users = await instance.radio.getConnectedUsers();
```

### getConnectedUser(roomId, identity)
Fetches a specific connected radio user by room and identity.
```js
const user = await instance.radio.getConnectedUser(1, 'account-uuid');
```

### setUserChannels(roomId, identity, options)
Updates a user's transmit or scan channels for a specific radio room.
```js
await instance.radio.setUserChannels(1, 'account-uuid', { transmit: 12, scan: [10, 11, 12] });
```

### setUserDisplayName(accId, displayName)
Sets the user's radio display name.
```js
await instance.radio.setUserDisplayName('account-uuid', 'Dispatch 101');
```

### getServerSubscriptionFromIp()
Resolves the community's subscription level for the calling server IP.
```js
const subscription = await instance.radio.getServerSubscriptionFromIp();
```

### setServerIp(pushUrl)
Registers the push event URL for radio webhooks.
```js
await instance.radio.setServerIp('https://example.com/sonoran-radio');
```

### setInGameSpeakerLocations(locations, token?)
Publishes available in-game speaker locations for tone routing.
```js
await instance.radio.setInGameSpeakerLocations(
  [{ name: 'Station 1', x: 123.4, y: 567.8, z: 90.1 }],
  'optional-bearer-token'
);
```

### playTone(roomId, tones, playTo)
Dispatches tones to channels, groups, or in-game speakers.
```js
await instance.radio.playTone(1, [1001, 1002], [
  { label: 'Primary Dispatch', type: 'channel', value: 10, group: 2 },
  { label: 'Station Speakers', type: 'game', value: 'station-1', group: null }
]);
```

## Further Documentation
More documentation for Sonoran CAD specific methods and usage can be found [here](/docs/CAD-Methods-and-Usage.md), Sonoran CMS specific methods and usage can be found [here](/docs/CMS-Methods-and-Usage.md), and usage information for the REST class [here](/docs/REST-Methods-and-Usage.md).
