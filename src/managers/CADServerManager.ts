import { Instance } from '../instance/Instance';
import * as globalTypes from '../constants';
import { APIError, CADServerAPIStruct } from '../libs/rest/src';
import { CADServer } from '../structures/CADServer';
import { CacheManager } from './CacheManager';
import { CADManager } from './CADManager';

export class CADServerManager extends CacheManager<number, CADServer, CADServerAPIStruct> {
  constructor(instance: Instance, private readonly manager: CADManager) {
    super(instance, CADServer, []);
    void this.initialize();
  }

  /**
   * Retrieves the CAD servers belonging to the community.
   */
  public async getServers(): Promise<CADServerAPIStruct[]> {
    if (!this.manager.rest) {
      throw new Error('CAD REST client is not initialized.');
    }
    const serversRes: any = await this.manager.rest.request('GET_SERVERS');
    const parsed = typeof serversRes === 'string' ? JSON.parse(serversRes) : serversRes;
    const servers = Array.isArray(parsed?.servers) ? parsed.servers : [];
    return servers;
  }

  /**
   * Updates the CAD server configuration.
   */
  public async setServers(servers: CADServerAPIStruct[], deployMap = false): Promise<globalTypes.CADStandardResponse<CADServerAPIStruct[]>> {
    if (!Array.isArray(servers) || servers.length === 0) {
      throw new Error('servers array must include at least one server configuration.');
    }
    if (!this.manager.rest) {
      throw new Error('CAD REST client is not initialized.');
    }
    try {
      const response: any = await this.manager.rest.request('SET_SERVERS', servers, deployMap);
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      const updated = Array.isArray(parsed?.servers) ? parsed.servers : Array.isArray(parsed) ? parsed : [];
      if (updated.length > 0) {
        this.cache.clear();
        updated.forEach((server: CADServerAPIStruct) => {
          const serverStruct = { id: server.id, config: server };
          this._add(serverStruct, true, server.id);
        });
      }
      return { success: true, data: updated };
    } catch (err) {
      if (err instanceof APIError) {
        return { success: false, reason: err.response };
      }
      throw err;
    }
  }

  private async initialize(): Promise<void> {
    try {
      const servers = await this.getServers();
      servers.forEach((server: CADServerAPIStruct) => {
        const serverStruct = {
          id: server.id,
          config: server
        };
        this._add(serverStruct, true, server.id);
      });
    } catch (err) {
      throw new Error(String(err));
    }
  }
}
