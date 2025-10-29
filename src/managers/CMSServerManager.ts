import { Instance } from '../instance/Instance';
import { APIError, CMSServerAPIStruct } from '../libs/rest/src';
import * as globalTypes from '../constants';
import { CMSServer } from '../structures/CMSServer';
import { CacheManager } from './CacheManager';
import { CMSManager } from './CMSManager';

export class CMSServerManager extends CacheManager<number, CMSServer, CMSServerAPIStruct> {
  constructor(instance: Instance, private readonly manager: CMSManager) {
    super(instance, CMSServer, []);
    (async () => {
      const managerRef = this.manager;
      while(!managerRef.ready) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      } 
      try {
        const serversRes: any = await managerRef.rest?.request('GET_GAME_SERVERS');
        const servers = serversRes.servers;
        servers.forEach((server: CMSServerAPIStruct) => {
          const serverStruct = {
            id: server.id,
            config: server
          };
          this._add(serverStruct, true, server.id);
        });
        console.log(`Found ${servers.length} servers`);
      } catch (err) {
        throw new Error(String(err));
      }
    })();
  }

  public async setGameServers(servers: globalTypes.CMSSetGameServerStruct[]): Promise<globalTypes.CMSSetGameServersPromiseResult> {
    if (!Array.isArray(servers) || servers.length === 0) {
      throw new Error('servers array must include at least one server configuration.');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.manager.rest?.request('SET_GAME_SERVERS', servers);
        const updatedServers = (Array.isArray(response?.data) ? response.data : []) as CMSServerAPIStruct[];

        if (updatedServers.length > 0) {
          this.cache.clear();
          updatedServers.forEach((server) => {
            const serverStruct = {
              id: server.id,
              config: server
            };
            this._add(serverStruct, true, server.id);
          });
        }

        resolve({ success: true, data: updatedServers as globalTypes.CMSSetGameServerStruct[] });
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response });
        } else {
          reject(err);
        }
      }
    });
  }
}
