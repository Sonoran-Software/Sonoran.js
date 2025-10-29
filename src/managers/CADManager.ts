import { Instance } from '../instance/Instance';
import { CADSubscriptionVersionEnum } from '../constants';
import { APIError, DefaultCADRestOptions, REST } from '../libs/rest/src';
import { BaseManager } from './BaseManager';
import * as globalTypes from '../constants';
import type { Mutable } from '../constants';
import { CADServerManager } from './CADServerManager';

/**
 * Manages all Sonoran CAD data and methods to interact with the public API.
 */
export class CADManager extends BaseManager {
  public readonly ready = false;
  public readonly version: CADSubscriptionVersionEnum = 0;
  public readonly failReason: unknown = null;
  public rest: REST | undefined;
  public servers: CADServerManager | undefined;

  constructor(instance: Instance) {
    super(instance);

    this.rest = new REST(instance, this, globalTypes.productEnums.CAD, DefaultCADRestOptions);
    this.buildManager(instance);
  }

  protected async buildManager(instance: Instance) {
    const mutableThis = this as Mutable<CADManager>;
    try {
      const versionResp: any = await this.rest?.request('GET_VERSION');
      mutableThis.version = Number.parseInt(versionResp.replace(/(^\d+)(.+$)/i,'$1'));
      if (this.version >= globalTypes.CADSubscriptionVersionEnum.STANDARD) {
        this.servers = new CADServerManager(instance, this);
      }
      instance.isCADSuccessful = true;
      instance.emit('CAD_SETUP_SUCCESSFUL');
    } catch (err) {
      mutableThis.failReason = err;
      instance.emit('CAD_SETUP_UNSUCCESSFUL', err);
      throw err;
    }
  }

  /**
   * Gets a community account by `accId` or `apiId`.
   * @param {Object} params The object that contains parameters to get a community account.
   * @param {string} [data.accId] The account id to find a community account.
   * @param {string} [data.apiId] The api id to find a community account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the account data object if found.
   */
  public async getAccount(params: { apiId?: string, username?: string }): Promise<globalTypes.CADGetAccountPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const getAccountRequest: any = await this.rest?.request('GET_ACCOUNT', params.apiId, params.username);
        resolve({ success: true, data: getAccountRequest });
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response });
        } else {
          reject(err);
        }
      }
    });
  }

  /**
   * Updates the CAD clock to match in-game time.
   */
  public async setClockTime(data: { serverId: number; currentUtc: string; currentGame: string; secondsPerHour: number }): Promise<globalTypes.CADSetClockTimePromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('SET_CLOCK', data);
        resolve({ success: true, data: response });
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response });
        } else {
          reject(err);
        }
      }
    });
  }

  /**
   * Adds accounts to the community via the join community endpoint.
   * NOTE: This endpoint is intended for internal CMS use and requires an internal key.
   */
  public async joinCommunity(internalKey: string, accounts: string | { account: string } | Array<string | { account: string }>): Promise<globalTypes.CADJoinCommunityPromiseResult> {
    if (!internalKey) {
      throw new Error('internalKey is required to join a community.');
    }
    const normalizedAccounts = this.normalizeAccountEntries(accounts);
    if (normalizedAccounts.length === 0) {
      throw new Error('At least one account must be provided to join the community.');
    }
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('JOIN_COMMUNITY', { internalKey, accounts: normalizedAccounts });
        resolve({ success: true, data: response });
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response });
        } else {
          reject(err);
        }
      }
    });
  }

  /**
   * Removes accounts from the community via the leave community endpoint.
   * NOTE: This endpoint is intended for internal CMS use and requires an internal key.
   */
  public async leaveCommunity(internalKey: string, accounts: string | { account: string } | Array<string | { account: string }>): Promise<globalTypes.CADLeaveCommunityPromiseResult> {
    if (!internalKey) {
      throw new Error('internalKey is required to leave a community.');
    }
    const normalizedAccounts = this.normalizeAccountEntries(accounts);
    if (normalizedAccounts.length === 0) {
      throw new Error('At least one account must be provided to leave the community.');
    }
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('LEAVE_COMMUNITY', { internalKey, accounts: normalizedAccounts });
        resolve({ success: true, data: response });
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response });
        } else {
          reject(err);
        }
      }
    });
  }

  private normalizeAccountEntries(input: string | { account: string } | Array<string | { account: string }>): { account: string }[] {
    const entries = Array.isArray(input) ? input : [input];
    return entries
      .filter((entry): entry is string | { account: string } => entry !== undefined && entry !== null)
      .map((entry) => {
        if (typeof entry === 'string') {
          return { account: entry };
        }
        if ('account' in entry) {
          return { account: entry.account };
        }
        throw new Error('Invalid account entry provided.');
      });
  }
}
