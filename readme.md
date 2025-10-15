# Sonoran.js
Sonoran.js is a library that allows you to interact with the [Sonoran CAD](https://sonorancad.com/) and [Sonoran CMS](https://sonorancms.com/) API. Based off of and utilizes several Discord.js library techniques for ease of use.

## Example Instance Setup

Utilizing both Sonoran CMS & Sonoran CAD
```js
const Sonoran = require('sonoran.js');
const instance = Sonoran.instance({
  cadCommunityId: 'mycommunity',
  cadApiKey: 'DF58F1E-FD8A-44C5-BA',
  cmsCommunityId: 'mycommunity',
  cmsApiKey: 'e6ba9d68-ca7a-4e59-a9e2-93e275b4e0bf'
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
### getAccount
Returns the user's account object.
#### Argument `params`
##### Type: `object` `{apiId?, username?}`
```js
const params = {
 apiId: '',
 username: 'SomeUser',
};
// Get user account object
const account = await instance.cad.getAccount(params);
```

## CMS Functions
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
##### Type `object` `{accId?: string, apiId?: string, forceClockIn?: boolean, discord?: string, uniqueId?: string}`
```js
const params = {
 accId: '',
 apiId: '',
 forceClockIn: true,
 discord: '',
 uniqueId: '1234',
};
// Clocks a user in or out
const clock = await instance.cms.clockInOut(params);
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
Gets all department information for a CMS community
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

## Further Documentation
More documentation for Sonoran CAD specific methods and usage can be found [here](/docs/CAD-Methods-and-Usage.md), Sonoran CMS specific methods and usage can be found [here](/docs/CMS-Methods-and-Usage.md), and usage information for the REST class [here](/docs/REST-Methods-and-Usage.md).
