const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('node:http');
const { Instance, productEnums, REST } = require('../dist');

test('CAD v2 starts with just an API key in either configuration form', { timeout: 7000 }, async (t) => {
  const requests = [];
  const server = createServer((request, response) => {
    requests.push([request.method, request.url, request.headers.authorization]);
    response.setHeader('Content-Type', 'application/json');
    response.end(request.url === '/v2/general/version' ? '{"version":4}' : '[]');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const cadApiUrl = `http://127.0.0.1:${server.address().port}`;

  for (const options of [
    { product: productEnums.CAD, apiKey: 'test-key', serverId: 7 },
    { cadApiKey: 'test-key', cadDefaultServerId: 7 },
  ]) {
    const instance = new Instance({ ...options, cadApiUrl });
    await once(instance, 'CAD_SETUP_SUCCESSFUL');
    assert.equal(instance.isCADSuccessful, true);
    assert.equal(instance.cad.version, 4);
    assert.equal(instance.cad.servers, undefined);
    assert.equal((await instance.cad.getFiveMConfigurationV2()).success, true);
  }

  const expectedRequests = [
    ['GET', '/v2/general/version', 'Bearer test-key'],
    ['GET', '/v2/fivem/servers/7/configuration', 'Bearer test-key'],
  ];
  assert.deepEqual(requests, [...expectedRequests, ...expectedRequests]);
});

test('CAD with a community ID keeps legacy version and server setup', { timeout: 1000 }, async (t) => {
  const calls = [];
  t.mock.method(REST.prototype, 'request', function (type) {
    calls.push([type, this.instance.cadCommunityId]);
    return Promise.resolve(type === 'GET_VERSION' ? '4 PRO' : { servers: [] });
  });

  const instance = new Instance({ product: productEnums.CAD, apiKey: 'test-key', communityId: 'test-community' });
  await once(instance, 'CAD_SETUP_SUCCESSFUL');

  assert.ok(instance.cad.servers);
  assert.deepEqual(calls, [['GET_VERSION', 'test-community'], ['GET_SERVERS', 'test-community']]);
});

test('CAD reports an API key setup failure through the setup event', { timeout: 1000 }, async (t) => {
  const { CADManager } = require('../dist/managers/CADManager');
  t.mock.method(CADManager.prototype, 'getVersionV2', async () => ({ success: false, reason: 'Invalid API key.' }));

  const instance = new Instance({ product: productEnums.CAD, apiKey: 'invalid-key' });
  const [error] = await once(instance, 'CAD_SETUP_UNSUCCESSFUL');
  assert.equal(error.message, 'Invalid API key.');
  assert.equal(instance.cad.failReason, error);
  assert.equal(instance.isCADSuccessful, false);
});
