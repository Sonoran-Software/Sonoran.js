import { Instance } from '../instance/Instance';
import { APIError, CMSServerAPIStruct } from '../libs/rest/src';
import * as globalTypes from '../constants';
import { CMSServer } from '../structures/CMSServer';
import { CacheManager } from './CacheManager';
import { CMSManager } from './CMSManager';

export class CMSServerManager extends CacheManager<number, CMSServer, CMSServerAPIStruct> {
  constructor(instance: Instance, private readonly manager: CMSManager) {
    super(instance, CMSServer, []);
    void this.initialize();
  }

  /**
   * Retrieves the CMS game servers belonging to the community.
   */
  public async getGameServers(): Promise<CMSServerAPIStruct[]> {
    const serversRes: any = await this.manager.rest?.request('GET_GAME_SERVERS');
    const parsed = typeof serversRes === 'string' ? JSON.parse(serversRes) : serversRes;
    const servers = Array.isArray(parsed?.servers) ? parsed.servers : [];
    return servers;
  }

  private async initialize(): Promise<void> {
    const managerRef = this.manager;
    while(!managerRef.ready) {
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
    try {
      const servers = await this.getGameServers();
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
  }

  public async setGameServers(servers: globalTypes.CMSSetGameServerStruct[]): Promise<globalTypes.CMSSetGameServersPromiseResult> {
    if (!Array.isArray(servers) || servers.length === 0) {
      throw new Error('servers array must include at least one server configuration.');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.manager.rest?.request('SET_GAME_SERVERS', servers);
        const updatedServers = CMSServerManager.resolveUpdatedServers(response);

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

  public async addGameServers(servers: globalTypes.CMSSetGameServerStruct[]): Promise<globalTypes.CMSSetGameServersPromiseResult> {
    if (!Array.isArray(servers) || servers.length === 0) {
      throw new Error('servers array must include at least one server configuration.');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.manager.rest?.request('ADD_GAME_SERVERS', servers);
        const updatedServers = CMSServerManager.resolveUpdatedServers(response);

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

  private static resolveUpdatedServers(response: any): CMSServerAPIStruct[] {
    return (Array.isArray(response?.data?.servers)
      ? response.data.servers
      : Array.isArray(response?.servers)
        ? response.servers
        : Array.isArray(response?.data)
          ? response.data
          : []) as CMSServerAPIStruct[];
  }
}
