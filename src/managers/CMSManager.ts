import { Instance } from '../instance/Instance';
import { CMSSubscriptionVersionEnum } from '../constants';
import { APIError, DefaultCMSRestOptions, REST } from '../libs/rest/src';
import { BaseManager } from './BaseManager';
import * as globalTypes from '../constants';
import { CMSServerManager } from './CMSServerManager';

/**
 * Manages all Sonoran CMS data and methods to interact with the public API.
 */
export class CMSManager extends BaseManager {
  public readonly ready: boolean = false;
  public readonly version: CMSSubscriptionVersionEnum = 0;
  public readonly failReason: unknown = null;
  public rest: REST | undefined;
  public servers: CMSServerManager | undefined;

  constructor(instance: Instance) {
    super(instance);

    this.rest = new REST(instance, this, globalTypes.productEnums.CMS, DefaultCMSRestOptions);
    this.buildManager(instance);
  }

  protected async buildManager(instance: Instance) {
    const mutableThis = this as globalTypes.Mutable<CMSManager>;
    try {
      const versionResp: any = await this.rest?.request('GET_SUB_VERSION');
      const version = Number.parseInt(versionResp.replace(/(^\d+)(.+$)/i,'$1'));
      if (version >= globalTypes.CMSSubscriptionVersionEnum.STANDARD) {
        this.servers = new CMSServerManager(instance, this);
      }
      mutableThis.ready = true;
      mutableThis.version = version;
      instance.isCMSSuccessful = true;
      instance.emit('CMS_SETUP_SUCCESSFUL');
    } catch (err) {
      mutableThis.failReason = err;
      instance.emit('CMS_SETUP_UNSUCCESSFUL', err);
      throw err;
    }
  }

  /**
   * Verifies the whitelist of a given account with the given parameters to search of said account.
   * @param {Object | string} data The object or [accId | apiId as a string] that contains data to get a community account to verify if it has whitelist to the specified server. *If given as a string it will default to the set or default cms server id (1).
   * @param {string} [data.accId] The account id to find a community account.
   * @param {string} [data.apiId] The api id to find a community account.
   * @param {string} [data.serverId] The username to find a community account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the account data object if found.
   */
  public async verifyWhitelist(data: { accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: number, serverId?: number } | string): Promise<globalTypes.CMSVerifyWhitelistPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const isString = typeof data === 'string';
        const whitelistRequest: any = await this.rest?.request('VERIFY_WHITELIST', isString ? data : data.apiId, isString ? data : data.accId, isString ? this.instance.cmsDefaultServerId : data.serverId ?? this.instance.cmsDefaultServerId, isString ? undefined : data.username, isString ? undefined : data.discord, isString ? undefined : data.uniqueId);
        if (typeof whitelistRequest === 'string') {
          resolve({ success: true, reason: whitelistRequest });
        } else {
          resolve({ success: false, reason: whitelistRequest.message });
        }
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response, backendError: true });
        } else {
          reject(err);
        }
      }
    });
  }

  /**
   * Gets a full whitelist allowed list for a specific server.
   * @param {number} serverId (Optional) Server ID to get the whole allow list for, if not specified it will grab the default server ID that is set.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the account data object if found.
   */
  public async getFullWhitelist(serverId?: number): Promise<globalTypes.CMSGetFullWhitelistPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const getFullWhitelistRequest: any = await this.rest?.request('FULL_WHITELIST', serverId ?? this.instance.cmsDefaultServerId);
        resolve({ success: true, data: getFullWhitelistRequest });
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
   * Gets a community account by `accId`, `apiId`, or `username`.
   * @param {Object} params The object that contains parameters to get a community account.
   * @param {string} [data.accId] The account id to find a community account.
   * @param {string} [data.apiId] The api id to find a community account.
   * @param {string} [data.username] The username to find a community account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the account data object if found.
   */
  public async getComAccount(params: { accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: string }): Promise<globalTypes.CMSGetComAccountPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const getAccountRequest: any = await this.rest?.request('GET_COM_ACCOUNT', params.apiId, params.username, params.accId, params.discord, params.uniqueId);
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
   * Gets a community account by `accId`, `apiId`, or `username`.
   * @param {Object} params The object that contains parameters to get a community account.
   * @param {string} [data.accId] (Optional) The account id to find a community account.
   * @param {string} [data.apiId] (Optional) The api id to find a community account.
   * @param {string} [data.username] (Optional) The username to find a community account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the account data object if found.
   */
  public async getAccountRanks(params: { accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: string }): Promise<globalTypes.CMSGetAccountRanksPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const getAccountRanksRequest: any = await this.rest?.request('GET_ACCOUNT_RANKS', params.apiId, params.username, params.accId, params.discord, params.uniqueId);
        resolve({ success: true, data: getAccountRanksRequest });
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
   * Clocks in or out an account by `accId` or `apiId`.
   * @param {Object} data The object that contains critical data to clock in or out an account.
   * @param {string} [data.accId] (Optional) The account id to clock in or out.
   * @param {string} [data.apiId] (Optional) The api id to clock in or out.
   * @param {boolean} [data.forceClockIn] If true, it will override any current clock in with a new clock in at the time of the request.
   * @param {string} [data.discord] (Optional) The discord ID to clock in or out.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async clockInOut(data: { accId?: string, apiId?: string, forceClockIn?: boolean, discord?: string, uniqueId?: string }): Promise<globalTypes.CMSClockInOutPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const clockInOutRequest = await this.rest?.request('CLOCK_IN_OUT', data.apiId, data.accId, !!data.forceClockIn, data.discord, data.uniqueId);
        const clockInOutResponse = clockInOutRequest as globalTypes.clockInOutRequest;
        if (!clockInOutResponse) resolve({ success: false, reason: clockInOutRequest as string });
        resolve({ success: true, clockedIn: clockInOutResponse.completed });
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
   * Check if a given [apiId] is attached to any account within the community CMS.
   * @param {string} apiId The api id to check for an account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async checkComApiId(apiId: string): Promise<globalTypes.CMSCheckComApiIdPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const checkComApiIdRequest: any = await this.rest?.request('CHECK_COM_APIID', apiId);
        resolve({ success: true, username: checkComApiIdRequest as string });
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
   * Gets all department information within the community CMS.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async getDepartments(): Promise<globalTypes.CMSGetDepartmentsPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const getDepartmentsRequest: any = await this.rest?.request('GET_DEPARTMENTS');
        resolve({ success: true, data: getDepartmentsRequest });
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
   * Sets a community account's ranks for the CMS community.
   * @param {string} accId The object that contains critical data to clock in or out an account.
   * @param {Object} changes The object that contains change data for setting account ranks.
   * @param {Object} [changes.set] (Optional) The object that contains primary and secondary data for setting account ranks.
   * @param {string} [changes.set.primary] (Optional) The primary rank ID wanting to set to the account.
   * @param {string} [changes.set.secondary] (Optional) The secondary rank ID(s) wanting to set to the account.
   * @param {Array} [changes.add] (Optional) The secondary rank IDs wanting to add to the account.
   * @param {Array} [changes.remove] (Optional) The secondary rank IDs wanting to remove to the account.
   * @param {string} [discord] (Optional) The discord ID to set the ranks for.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async setAccountRanks(changes: globalTypes.CMSSetAccountRanksChangesObject, apiId?: string, accId?: string, username?: string, discord?: string, uniqueId?: string): Promise<globalTypes.CMSSetAccountRanksPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const setAccountRanksRequest: any = await this.rest?.request('SET_ACCOUNT_RANKS', accId, changes.set, changes.add, changes.remove, apiId, username, discord, uniqueId);
        resolve({ success: true, data: setAccountRanksRequest });
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
   * Sets a community account's name for the CMS community.
   * @param {Object} data The object that contains critical data to set an account's name.
   * @param {string} [data.apiId] (Optional) The api id to set the account name.
   * @param {string} [data.username] (Optional) The username to set the account name.
   * @param {string} [data.accId] (Optional) The account id to set the account name.
   * @param {string} [data.discord] (Optional) The discord id to set the account name.
   * @param {string} [data.uniqueId] (Optional) The unique id to set the account name.
   * @param {string} [data.newName] (Optional) The new name to set the account name.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async setAccountName(apiId: string | undefined, username: string | undefined, accId: string | undefined, discord: string | undefined, uniqueId: string | undefined, newName: string ): Promise<globalTypes.CMSSetAccountNamePromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const setAccountNameRequest: any = await this.rest?.request('SET_ACCOUNT_NAME', apiId, username, accId, discord, uniqueId, newName);
        resolve({ success: true, data: setAccountNameRequest });
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
   *
   * @param {Object} params The object that contains parameters to ban an account.
   * @param {string} [params.apiId] (Optional) The api id to ban the account.
   * @param {string} [params.username] (Optional) The username to ban the account.
   * @param {string} [params.accId] (Optional) The account id to ban the account.
   * @param {string} [params.discord] (Optional) The discord id to ban the account.
   * @param {string} [params.uniqueId] (Optional) The unique id to ban the account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async cmsBanAccount(params: {apiId?: string, username?: string, accId?: string, discord?: string, uniqueId?: string}): Promise<globalTypes.CMSBanAccountPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const banAccountRequest: any = await this.rest?.request('BAN_ACCOUNT', params.apiId, params.username, params.accId, params.discord, params.uniqueId);
        resolve({ success: true, reason: banAccountRequest });
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
   *
   * @param {Object} params The object that contains parameters to kick an account.
   * @param {string} [params.apiId] (Optional) The api id to kick the account.
   * @param {string} [params.username] (Optional) The username to kick the account.
   * @param {string} [params.accId] (Optional) The account id to kick the account.
   * @param {string} [params.discord] (Optional) The discord id to kick the account.
   * @param {string} [params.uniqueId] (Optional) The unique id to kick the account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async cmsKickAccount(params: {apiId?: string, username?: string, accId?: string, discord?: string, uniqueId?: string}): Promise<globalTypes.CMSKickAccountPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const kickAccountRequest: any = await this.rest?.request('KICK_ACCOUNT', params.apiId, params.username, params.accId, params.discord, params.uniqueId);
        resolve({ success: true, reason: kickAccountRequest });
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
   *
   * @param {Object} params The object that contains parameters to kick an account.
   * @param {string} [params.apiId] (Optional) The api id to kick the account.
   * @param {string} [params.username] (Optional) The username to kick the account.
   * @param {string} [params.accId] (Optional) The account id to kick the account.
   * @param {string} [params.discordId] (Optional) The discord id to kick the account.
   * @param {string} [params.uniqueId] (Optional) The unique id to kick the account.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed.
   */
  public async forceSync(params: {apiId?: string, username?: string, accId?: string, discordId?: string, uniqueId?: string}): Promise<globalTypes.CMSForceSyncPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const forceSyncRequest: any = await this.rest?.request('FORCE_SYNC', params.apiId, params.username, params.accId, params.discordId, params.uniqueId);
        resolve({ success: true, reason: forceSyncRequest });
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
   * Gets a list of online ERLC players for the given roblox join code.
   * @param {string} robloxJoinCode The roblox join code to get the online players for.
   * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the list of online players if successful.
   */
  public async erlcGetOnlinePlayers(robloxJoinCode: string): Promise<globalTypes.CMSERLCGetOnlinePlayersPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const erlcGetOnlinePlayersRequest: any = await this.rest?.request('ERLC_GET_ONLINE_PLAYERS', robloxJoinCode);
        resolve({ success: true, data: erlcGetOnlinePlayersRequest });
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
   * Toggles RSVP for the provided event and account.
   */
  public async rsvp(eventId: string, params: { apiId?: string, username?: string, accId?: string, discord?: string, uniqueId?: string } = {}): Promise<globalTypes.CMSRsvpPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RSVP', eventId, params.apiId, params.accId, params.discord, params.uniqueId);
        if (typeof response === 'string') {
          resolve({ success: true, status: response });
        } else {
          resolve({ success: true, data: response });
        }
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
   * Retrieves submissions for a specific form template.
   */
  public async getFormSubmissions<T = unknown>(templateId: number, options: { skip?: number, take?: number } = {}): Promise<globalTypes.CMSGetFormSubmissionsPromiseResult<T>> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('GET_FORM_TEMPLATE_SUBMISSIONS', templateId, options.skip, options.take);
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
   * Updates profile fields for the specified account.
   */
  public async editAccountProfileFields(params: { apiId?: string, username?: string, accId?: string, discord?: string, uniqueId?: string, profileFields: globalTypes.CMSProfileFieldUpdate[] }): Promise<globalTypes.CMSEditAccountProfileFieldsPromiseResult> {
    if (!params.profileFields || params.profileFields.length === 0) {
      throw new Error('profileFields array must include at least one value.');
    }

    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('EDIT_ACC_PROFLIE_FIELDS', params.apiId, params.username, params.accId, params.discord, params.uniqueId, params.profileFields);
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
   * Gets the current clock in entry for a community member.
   * @param {Object} params Identification parameters for the account.
   */
  public async getCurrentClockIn(params: { accId?: string, apiId?: string, username?: string, discord?: string, uniqueId?: string }): Promise<globalTypes.CMSGetCurrentClockInPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('GET_CURRENT_CLOCK_IN', params.apiId, params.username, params.accId, params.discord, params.uniqueId);
        if (typeof response === 'string') {
          resolve({ success: true, reason: response, data: null });
        } else {
          resolve({ success: true, data: response });
        }
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
   * Retrieves community accounts using optional pagination and status filters.
   */
  public async getAccounts(options: { skip?: number, take?: number, sysStatus?: boolean, comStatus?: boolean, banned?: boolean, archived?: boolean } = {}): Promise<globalTypes.CMSGetAccountsPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('GET_ACCOUNTS', options);
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
   * Retrieves configured profile fields for the community.
   */
  public async getProfileFields(): Promise<globalTypes.CMSGetProfileFieldsPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('GET_PROFILE_FIELDS');
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
   * Gets the current ERLC player queue count for the provided roblox join code.
   * @param {string} robloxJoinCode The roblox join code to get the player queue size for.
   * @returns {Promise} Promise object indicates success and includes the queue count when successful.
   */
  public async erlcGetPlayerQueue(robloxJoinCode: string): Promise<globalTypes.CMSERLCGetPlayerQueuePromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const erlcGetPlayerQueueRequest: any = await this.rest?.request('ERLC_GET_PLAYER_QUEUE', robloxJoinCode);
        resolve({ success: true, data: erlcGetPlayerQueueRequest });
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
   * Adds a new ERLC record for a player.
   * @param {Object} data The object that contains critical data to add a new ERLC record.
   * @param {string} data.robloxJoinCode The roblox join code to add the record to.
   * @param {string|number} data.executerDiscordId The discord ID of the person executing the record addition.
   * @param {string} data.type The type of record being added (e.g., "Warning", "Infraction").
   * @param {string} data.reason The reason for the record being added.
   * @param {string|number} [data.playerDiscordId] (Optional) The discord ID of the player receiving the record.
   * @param {string|number} [data.playerRobloxId] (Optional) The roblox ID of the player receiving the record.
   * @param {number} [data.points] (Optional) The points associated with the record being added.
   * @return {Promise} Promise object represents if the request was successful with reason for failure if needed.
   * */
  public async erlcAddNewRecord(data: { robloxJoinCode: string, executerDiscordId: string | number, type: string, reason: string, playerDiscordId?: string | number, playerRobloxId?: string | number, points?: number }): Promise<globalTypes.CMSERLCAddNewRecordPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const erlcAddNewRecordRequest: any = await this.rest?.request('ERLC_ADD_NEW_RECORD', data.robloxJoinCode, data.executerDiscordId, data.type, data.reason, data.playerDiscordId, data.playerRobloxId, data.points);
        resolve({ success: true, reason: erlcAddNewRecordRequest });
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
