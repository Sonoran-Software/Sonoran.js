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
Returns the user account object.
#### Argument `params`
##### Type: `object` `{apiId?, username?}`
```js
const params = {
 apiId: '',
 username: 'SomeUser',
};
const account = await instance.cad.getAccount(params);
```

## CMS Functions
### verifyWhitelist
Verifies that a user is whitelisted in the specified server.
#### Arugment `data`
##### Type `object` `{accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: number, serverId?}`
##### Type `string` (Account UUID or API ID as a string)
*Note: If passing a `string` for data (Account UUID or API ID) the `serverId` will default to `1`*
```js
const data = {
 accId: '',
 apiId: '',
 username: '',
 discord: '',
 uniqueId: 1234,
 serverId: 1
};
const isWhitelisted = await instance.cad.verifyWhitelist(data);
```

## Further Documentation
More documentation for Sonoran CAD specific methods and usage can be found [here](/docs/CAD-Methods-and-Usage.md), Sonoran CMS specific methods and usage can be found [here](/docs/CMS-Methods-and-Usage.md), and usage information for the REST class [here](/docs/REST-Methods-and-Usage.md).
