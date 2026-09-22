const test = require('node:test');
const assert = require('node:assert/strict');
const { CADManager } = require('../dist/managers/CADManager');
test('FiveM configuration uses default/explicit servers and a bodyless acknowledgement', async () => {
  const client = Object.create(CADManager.prototype);
  client.instance = { cadDefaultServerId: 7 };
  const calls = [];
  client.executeCadV2Request = async (...args) => { calls.push(args); return { success: true, data: { revision: 4 } }; };
  assert.equal((await client.getFiveMConfigurationV2()).data.revision, 4);
  await client.getFiveMConfigurationV2(2);
  await client.acknowledgeFiveMConfigurationV2(undefined, 4);
  assert.deepEqual(calls, [
    ['GET', 'v2/fivem/servers/7/configuration'],
    ['GET', 'v2/fivem/servers/2/configuration'],
    ['POST', 'v2/fivem/servers/7/configuration/acknowledge/4']
  ]);
  for (const revision of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])
    await assert.rejects(client.acknowledgeFiveMConfigurationV2(7, revision));
  await assert.rejects(client.getFiveMConfigurationV2(0));
  assert.equal(calls.length, 3);
});
