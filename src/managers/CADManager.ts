import { Instance } from '../instance/Instance';
import { CADSubscriptionVersionEnum } from '../constants';
import { APIError, DefaultCADRestOptions, REST } from '../libs/rest/src';
import fetch, { Response } from 'node-fetch';
import { AbortController } from 'node-abort-controller';
import type {
  RESTTypedAPIDataStructs,
  CADPenalCodeStruct,
  CADSetAPIIDStruct,
  CADNewEditRecordOptionOneStruct,
  CADNewEditRecordOptionTwoStruct,
  CADSendDraftStruct,
  CADLookupByIntStruct,
  CADLookupStruct,
  CADModifyAccountPermsStruct,
  CADKickBanUserStruct,
  CADSetPostalStruct,
  CADModifyIdentifierStruct,
  CADIdentsToGroupStruct,
  CADAddBlipStruct,
  CADModifyBlipStruct,
  CADGetCallsStruct,
  CADGetMyCallStruct,
  CADAddCallNoteStruct,
  CADRemove911Struct,
  CADGetActiveUnitsStruct,
  CADNewDispatchStruct,
  CADEditDispatchStruct,
  CADAttachUnitsStruct,
  CADDetachUnitsStruct,
  CADStreetSignStruct,
  CADUnitLocationStruct,
  CADUnitStatusStruct,
  CADUnitPanicStruct
} from '../libs/rest/src';
import { BaseManager } from './BaseManager';
import * as globalTypes from '../constants';
import type { Mutable } from '../constants';
import { CADServerManager } from './CADServerManager';

type CADV2HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

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
      const version = await this.getVersion();
      mutableThis.version = version;
      if (version >= globalTypes.CADSubscriptionVersionEnum.STANDARD) {
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

  private getRest(): REST {
    if (!this.rest) {
      throw new Error('CAD REST client is not initialized.');
    }
    return this.rest;
  }

  private async executeCadRequest<K extends keyof RESTTypedAPIDataStructs, T = unknown>(type: K, ...args: RESTTypedAPIDataStructs[K]): Promise<globalTypes.CADStandardResponse<T>> {
    try {
      const response = await this.getRest().request(type, ...args);
      return { success: true, data: response as T };
    } catch (err) {
      if (err instanceof APIError) {
        return { success: false, reason: err.response };
      }
      throw err;
    }
  }

  /**
   * Retrieves the community's CAD subscription version.
   */
  public async getVersion(): Promise<number> {
    const versionResp: any = await this.rest?.request('GET_VERSION');
    const versionString = String(versionResp);
    return Number.parseInt(versionString.replace(/(^\d+)(.+$)/i, '$1'), 10);
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

  /**
   * Updates the penal code configuration for the community.
   */
  public async setPenalCodes(codes: CADPenalCodeStruct[]): Promise<globalTypes.CADStandardResponse> {
    if (!Array.isArray(codes) || codes.length === 0) {
      throw new Error('codes array must include at least one penal code entry.');
    }
    return this.executeCadRequest('SET_PENAL_CODES', codes);
  }

  /**
   * Assigns API IDs to a community account.
   */
  public async setAccountApiIds(data: CADSetAPIIDStruct): Promise<globalTypes.CADStandardResponse> {
    if (!data?.username || !Array.isArray(data.apiIds)) {
      throw new Error('username and apiIds are required to set account API IDs.');
    }
    return this.executeCadRequest('SET_API_ID', data);
  }

  /**
   * Retrieves record templates filtered by a specific record type.
   */
  public async getRecordTemplates(recordTypeId?: number): Promise<globalTypes.CADStandardResponse> {
    if (typeof recordTypeId === 'number') {
      return this.executeCadRequest('GET_TEMPLATES', recordTypeId);
    }
    return this.executeCadRequest('GET_TEMPLATES');
  }

  /**
   * Creates a new record entry.
   */
  public async createRecord(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('NEW_RECORD', data);
  }

  /**
   * Sends a record draft with populated fields.
   */
  public async sendDraft(data: CADSendDraftStruct): Promise<globalTypes.CADStandardResponse> {
    if (!data || typeof data !== 'object') {
      throw new Error('data is required when sending a draft.');
    }
    if (!data.apiId && !data.account) {
      throw new Error('apiId or account is required when sending a draft.');
    }
    if (!Number.isInteger(data.recordTypeId)) {
      throw new Error('recordTypeId must be an integer when sending a draft.');
    }
    if (!data.replaceValues || typeof data.replaceValues !== 'object') {
      throw new Error('replaceValues is required when sending a draft.');
    }
    return this.executeCadRequest('SEND_DRAFT', data);
  }

  /**
   * Updates an existing record entry.
   */
  public async updateRecord(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('EDIT_RECORD', data);
  }

  /**
   * Removes a record by its identifier.
   */
  public async removeRecord(id: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(id)) {
      throw new Error('id must be an integer when removing a record.');
    }
    return this.executeCadRequest('REMOVE_RECORD', id);
  }

  /**
   * Performs an internal lookup using the CAD lookup by identifier endpoint.
   */
  public async lookupByInt(data: CADLookupByIntStruct): Promise<globalTypes.CADStandardResponse> {
    if (!data || !('searchType' in data) || !('value' in data)) {
      throw new Error('searchType and value are required for lookupByInt.');
    }
    return this.executeCadRequest('LOOKUP_INT', data);
  }

  /**
   * Executes a CAD lookup using first/last name, plate, or other values.
   * Supports identifying the requester via `apiId` or `account` (UUID).
   */
  public async lookupRecords(data: CADLookupStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('LOOKUP', data);
  }

  /**
   * Checks whether the provided API ID exists.
   */
  public async checkApiId(apiId: string): Promise<globalTypes.CADStandardResponse> {
    if (!apiId) {
      throw new Error('apiId is required to check for existence.');
    }
    return this.executeCadRequest('CHECK_APIID', apiId);
  }

  /**
   * Applies a permission key to an account.
   */
  public async applyPermissionKey(apiId: string | undefined, permissionKey: string): Promise<globalTypes.CADStandardResponse> {
    if (!permissionKey) {
      throw new Error('permissionKey is required when applying a permission key.');
    }
    return this.executeCadRequest('APPLY_PERMISSION_KEY', apiId, permissionKey);
  }

  /**
   * Sets account permissions for a CAD user.
   */
  public async setAccountPermissions(data: CADModifyAccountPermsStruct): Promise<globalTypes.CADStandardResponse> {
    if (!data || (!Array.isArray(data.add) && !Array.isArray(data.remove))) {
      throw new Error('At least one permission change is required.');
    }
    return this.executeCadRequest('SET_ACCOUNT_PERMISSIONS', data);
  }

  /**
   * Bans or kicks a CAD user.
   */
  public async banUser(data: CADKickBanUserStruct): Promise<globalTypes.CADStandardResponse> {
    if (!data?.apiId) {
      throw new Error('apiId is required when banning or kicking a user.');
    }
    return this.executeCadRequest('BAN_USER', data);
  }

  /**
   * Verifies a secret string against CAD configuration.
   */
  public async verifySecret(secret: string): Promise<globalTypes.CADStandardResponse> {
    if (!secret) {
      throw new Error('secret is required to verify.');
    }
    return this.executeCadRequest('VERIFY_SECRET', secret);
  }

  /**
   * Authorizes street sign changes for a CAD server.
   */
  public async authorizeStreetSigns(serverId: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when authorizing street signs.');
    }
    return this.executeCadRequest('AUTH_STREETSIGNS', serverId);
  }

  /**
   * Replaces the community postal list.
   */
  public async setPostals(data: CADSetPostalStruct[]): Promise<globalTypes.CADStandardResponse> {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('data must include at least one postal entry.');
    }
    return this.executeCadRequest('SET_POSTALS', data);
  }

  /**
   * Sends a photo to CAD for the provided API ID.
   */
  public async sendPhoto(apiId: string | undefined, url: string): Promise<globalTypes.CADStandardResponse> {
    if (!url) {
      throw new Error('url is required to send a CAD photo.');
    }
    return this.executeCadRequest('SEND_PHOTO', apiId, url);
  }

  /**
   * Retrieves characters belonging to an API ID.
   */
  public async getCharacters(apiId: string): Promise<globalTypes.CADStandardResponse> {
    if (!apiId) {
      throw new Error('apiId is required to fetch characters.');
    }
    return this.executeCadRequest('GET_CHARACTERS', apiId);
  }

  /**
   * Creates a new civilian character.
   */
  public async createCharacter(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('NEW_CHARACTER', data);
  }

  /**
   * Updates an existing civilian character.
   */
  public async updateCharacter(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('EDIT_CHARACTER', data);
  }

  /**
   * Removes a civilian character by identifier.
   */
  public async removeCharacter(id: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(id)) {
      throw new Error('id must be an integer when removing a character.');
    }
    return this.executeCadRequest('REMOVE_CHARACTER', id);
  }

  /**
   * Retrieves identifiers assigned to an API ID.
   */
  public async getIdentifiers(apiId: string): Promise<globalTypes.CADStandardResponse> {
    if (!apiId) {
      throw new Error('apiId is required to fetch identifiers.');
    }
    return this.executeCadRequest('GET_IDENTIFIERS', apiId);
  }

  /**
   * Modifies identifiers for an account.
   */
  public async modifyIdentifier(data: CADModifyIdentifierStruct): Promise<globalTypes.CADStandardResponse> {
    if (!data?.apiId) {
      throw new Error('apiId is required when modifying an identifier.');
    }
    return this.executeCadRequest('MODIFY_IDENTIFIER', data);
  }

  /**
   * Sets the active identifier by identifier ID.
   */
  public async setIdentifier(apiId: string | undefined, identId: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(identId)) {
      throw new Error('identId must be an integer when setting an identifier.');
    }
    return this.executeCadRequest('SET_IDENTIFIER', apiId, identId);
  }

  /**
   * Assigns identifiers to a group name.
   */
  public async setIdentifiersToGroup(entries: CADIdentsToGroupStruct | CADIdentsToGroupStruct[]): Promise<globalTypes.CADStandardResponse> {
    const payload = Array.isArray(entries) ? entries : [entries];
    if (payload.length === 0) {
      throw new Error('entries must include at least one identifier group update.');
    }
    payload.forEach((entry, index) => {
      if (!entry) {
        throw new Error(`entries[${index}] is required.`);
      }
      if (!Number.isInteger(entry.serverId)) {
        throw new Error(`entries[${index}].serverId must be an integer.`);
      }
      if (!Array.isArray(entry.identIds) || entry.identIds.some((id) => !Number.isInteger(id))) {
        throw new Error(`entries[${index}].identIds must be an array of integers.`);
      }
      if (typeof entry.groupName !== 'string') {
        throw new Error(`entries[${index}].groupName must be a string (use '' to clear).`);
      }
      if (entry.account !== undefined && typeof entry.account !== 'string') {
        throw new Error(`entries[${index}].account must be a string when provided.`);
      }
      if (entry.identIds.length === 0 && !entry.account) {
        throw new Error(`entries[${index}] must include account or at least one identId.`);
      }
    });
    return this.executeCadRequest('IDENTS_TO_GROUP', payload);
  }

  /**
   * Toggles panic state for a unit.
   */
  public async setUnitPanic(apiId: string | undefined, isPanic: boolean, identIds?: number[]): Promise<globalTypes.CADStandardResponse>;
  public async setUnitPanic(params: CADUnitPanicStruct): Promise<globalTypes.CADStandardResponse>;
  public async setUnitPanic(apiIdOrParams: string | CADUnitPanicStruct | undefined, isPanic?: boolean, identIds?: number[]): Promise<globalTypes.CADStandardResponse> {
    let payload: CADUnitPanicStruct;
    if (apiIdOrParams && typeof apiIdOrParams === 'object') {
      payload = { ...apiIdOrParams };
    } else {
      payload = { apiId: apiIdOrParams as string | undefined, isPanic: isPanic as boolean, identIds };
    }
    const { apiId, account, isPanic: resolvedPanic, identIds: resolvedIdentIds } = payload;
    if (resolvedPanic === undefined) {
      throw new Error('isPanic is required when setting unit panic.');
    }
    if (resolvedIdentIds !== undefined && (!Array.isArray(resolvedIdentIds) || resolvedIdentIds.some((id) => !Number.isInteger(id)))) {
      throw new Error('identIds must be an array of integers when setting unit panic.');
    }
    const hasIdentIds = Array.isArray(resolvedIdentIds) && resolvedIdentIds.length > 0;
    if (!apiId && !account && !hasIdentIds) {
      throw new Error('Either apiId, account, or identIds is required when setting unit panic.');
    }
    return this.executeCadRequest('UNIT_PANIC', {
      apiId,
      account,
      isPanic: resolvedPanic,
      identIds: hasIdentIds ? resolvedIdentIds : undefined
    });
  }

  /**
   * Updates a unit's status.
   */
  public async setUnitStatus(apiId: string | undefined, status: number, serverId: number, identIds?: number[]): Promise<globalTypes.CADStandardResponse>;
  public async setUnitStatus(params: { apiId?: string; account?: string; status: number; serverId: number; identIds?: number[] }): Promise<globalTypes.CADStandardResponse>;
  public async setUnitStatus(
    apiIdOrParams: string | undefined | { apiId?: string; account?: string; status: number; serverId: number; identIds?: number[] },
    status?: number,
    serverId?: number,
    identIds?: number[]
  ): Promise<globalTypes.CADStandardResponse> {
    let payload: CADUnitStatusStruct;
    if (apiIdOrParams && typeof apiIdOrParams === 'object' && !Array.isArray(apiIdOrParams)) {
      payload = {
        apiId: apiIdOrParams.apiId,
        account: apiIdOrParams.account,
        status: apiIdOrParams.status,
        serverId: apiIdOrParams.serverId,
        identIds: apiIdOrParams.identIds
      };
    } else {
      payload = { apiId: apiIdOrParams as string | undefined, status: status as number, serverId: serverId as number, identIds };
    }
    const { apiId, account, status: resolvedStatus, serverId: resolvedServerId, identIds: resolvedIdentIds } = payload;
    if (!Number.isInteger(resolvedServerId)) {
      throw new Error('serverId must be an integer when updating unit status.');
    }
    if (resolvedStatus === undefined) {
      throw new Error('status is required when updating unit status.');
    }
    if (resolvedIdentIds !== undefined && (!Array.isArray(resolvedIdentIds) || resolvedIdentIds.some((id) => !Number.isInteger(id)))) {
      throw new Error('identIds must be an array of integers when updating unit status.');
    }
    const hasIdentIds = Array.isArray(resolvedIdentIds) && resolvedIdentIds.length > 0;
    if (!apiId && !account && !hasIdentIds) {
      throw new Error('Either apiId, account, or identIds is required when updating unit status.');
    }
    return this.executeCadRequest('UNIT_STATUS', {
      apiId,
      account,
      status: resolvedStatus,
      serverId: resolvedServerId,
      identIds: hasIdentIds ? resolvedIdentIds : undefined
    });
  }

  /**
   * Retrieves live map blips for a CAD server.
   */
  public async getBlips(serverId: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when retrieving blips.');
    }
    return this.executeCadRequest('GET_BLIPS', serverId);
  }

  /**
   * Adds blips to the CAD map.
   */
  public async addBlips(blips: CADAddBlipStruct | CADAddBlipStruct[]): Promise<globalTypes.CADStandardResponse> {
    const payload = Array.isArray(blips) ? blips : [blips];
    if (payload.length === 0) {
      throw new Error('At least one blip must be provided when adding blips.');
    }
    return this.executeCadRequest('ADD_BLIP', payload);
  }

  /**
   * Updates existing CAD map blips.
   */
  public async updateBlips(blips: CADModifyBlipStruct | CADModifyBlipStruct[]): Promise<globalTypes.CADStandardResponse> {
    const payload = Array.isArray(blips) ? blips : [blips];
    if (payload.length === 0) {
      throw new Error('At least one blip must be provided when updating blips.');
    }
    return this.executeCadRequest('MODIFY_BLIP', payload);
  }

  /**
   * Removes a CAD map blip.
   */
  public async removeBlip(id: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(id)) {
      throw new Error('id must be an integer when removing a blip.');
    }
    return this.executeCadRequest('REMOVE_BLIP', id);
  }

  /**
   * Creates a new 911 call entry.
   */
  public async create911Call(params: { serverId: number; isEmergency: boolean; caller: string; location: string; description: string; metaData?: Record<string, string> }): Promise<globalTypes.CADStandardResponse> {
    const { serverId, isEmergency, caller, location, description, metaData = {} } = params;
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when creating a 911 call.');
    }
    return this.executeCadRequest('911_CALL', serverId, isEmergency, caller, location, description, metaData);
  }

  /**
   * Removes a 911 call by its identifier.
   */
  public async remove911Call(serverId: number, callId: number): Promise<globalTypes.CADStandardResponse>;
  public async remove911Call(params: CADRemove911Struct): Promise<globalTypes.CADStandardResponse>;
  public async remove911Call(serverIdOrParams: number | CADRemove911Struct, callId?: number): Promise<globalTypes.CADStandardResponse> {
    let payload: CADRemove911Struct;
    if (serverIdOrParams && typeof serverIdOrParams === 'object') {
      payload = { ...serverIdOrParams };
    } else {
      payload = { serverId: serverIdOrParams as number, callId: callId as number };
    }
    const { serverId, callId: resolvedCallId } = payload;
    if (!Number.isInteger(serverId) || !Number.isInteger(resolvedCallId)) {
      throw new Error('serverId and callId must be integers when removing a 911 call.');
    }
    return this.executeCadRequest('REMOVE_911', { serverId, callId: resolvedCallId });
  }

  /**
   * Retrieves dispatch calls with optional pagination.
   */
  public async getCalls(options: CADGetCallsStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('GET_CALLS', options);
  }

  /**
   * Retrieves the current call associated with the given account UUID.
   */
  public async getMyCall(options: CADGetMyCallStruct): Promise<globalTypes.CADStandardResponse> {
    if (!options?.account) {
      throw new Error('account is required when fetching current call.');
    }
    return this.executeCadRequest('GET_MY_CALL', options);
  }

  /**
   * Retrieves active units for the provided filters.
   */
  public async getActiveUnits(options: CADGetActiveUnitsStruct): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadRequest('GET_ACTIVE_UNITS', options);
  }

  /**
   * Kicks an active unit from the CAD.
   */
  public async kickUnit(apiId: string | undefined, reason: string, serverId: number): Promise<globalTypes.CADStandardResponse> {
    if (!reason) {
      throw new Error('reason is required when kicking a unit.');
    }
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when kicking a unit.');
    }
    return this.executeCadRequest('KICK_UNIT', apiId, reason, serverId);
  }

  /**
   * Creates a new dispatch call.
   */
  public async createDispatch(data: CADNewDispatchStruct): Promise<globalTypes.CADStandardResponse<globalTypes.CADDispatchCallStruct>> {
    const hasUnits = Array.isArray(data.units);
    const hasAccounts = Array.isArray(data.accounts);
    const payload: CADNewDispatchStruct = {
      ...data,
      ...(hasUnits ? { units: data.units } : {}),
      ...(hasAccounts ? { accounts: data.accounts } : {})
    };
    return this.executeCadRequest('NEW_DISPATCH', payload);
  }

  /**
   * Edits an existing dispatch call.
   */
  public async editDispatch(data: CADEditDispatchStruct): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(data.serverId) || !Number.isInteger(data.callId)) {
      throw new Error('serverId and callId must be integers when editing a dispatch call.');
    }

    const { serverId, callId, ...updates } = data;
    if (!Object.values(updates).some((value) => value !== undefined)) {
      throw new Error('At least one dispatch field must be provided when editing a dispatch call.');
    }

    return this.executeCadRequest('EDIT_DISPATCH', data);
  }

  /**
   * Attaches units to an existing dispatch call.
   */
  public async attachUnits(serverId: number, callId: number, unitsOrAccount: string[] | string, identIds?: number[]): Promise<globalTypes.CADStandardResponse>;
  public async attachUnits(params: CADAttachUnitsStruct): Promise<globalTypes.CADStandardResponse>;
  public async attachUnits(
    serverIdOrParams: number | CADAttachUnitsStruct,
    callId?: number,
    unitsOrAccount?: string[] | string,
    identIds?: number[]
  ): Promise<globalTypes.CADStandardResponse> {
    let payload: CADAttachUnitsStruct;
    if (serverIdOrParams && typeof serverIdOrParams === 'object') {
      payload = { ...serverIdOrParams };
    } else {
      payload = {
        serverId: serverIdOrParams as number,
        callId: callId as number,
        ...(Array.isArray(unitsOrAccount)
          ? { units: unitsOrAccount }
          : typeof unitsOrAccount === 'string'
            ? { account: unitsOrAccount }
            : {}),
        ...(Array.isArray(identIds) ? { identIds } : {})
      };
    }

    const { serverId, callId: resolvedCallId, units, account, identIds: resolvedIdentIds } = payload;
    if (!Number.isInteger(serverId) || !Number.isInteger(resolvedCallId)) {
      throw new Error('serverId and callId must be integers when attaching units.');
    }
    const hasUnits = Array.isArray(units) && units.length > 0;
    const hasAccount = typeof account === 'string' && account.length > 0;
    if (resolvedIdentIds !== undefined && (!Array.isArray(resolvedIdentIds) || resolvedIdentIds.some((id) => !Number.isInteger(id)))) {
      throw new Error('identIds must be an array of integers when attaching units.');
    }
    const hasIdentIds = Array.isArray(resolvedIdentIds) && resolvedIdentIds.length > 0;
    if (!hasUnits && !hasAccount && !hasIdentIds) {
      throw new Error('Either units, account, or identIds is required when attaching units.');
    }
    return this.executeCadRequest('ATTACH_UNIT', {
      serverId,
      callId: resolvedCallId,
      units: hasUnits ? units : undefined,
      account: hasAccount ? account : undefined,
      identIds: hasIdentIds ? resolvedIdentIds : undefined
    });
  }

  /**
   * Detaches units from dispatch calls.
   */
  public async detachUnits(serverId: number, unitsOrAccount: string[] | string): Promise<globalTypes.CADStandardResponse>;
  public async detachUnits(params: CADDetachUnitsStruct): Promise<globalTypes.CADStandardResponse>;
  public async detachUnits(
    serverIdOrParams: number | CADDetachUnitsStruct,
    unitsOrAccount?: string[] | string
  ): Promise<globalTypes.CADStandardResponse> {
    let payload: CADDetachUnitsStruct;
    if (serverIdOrParams && typeof serverIdOrParams === 'object') {
      payload = { ...serverIdOrParams };
    } else {
      payload = {
        serverId: serverIdOrParams as number,
        ...(Array.isArray(unitsOrAccount)
          ? { units: unitsOrAccount }
          : typeof unitsOrAccount === 'string'
            ? { account: unitsOrAccount }
            : {})
      };
    }

    const { serverId, units, account } = payload;
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when detaching units.');
    }
    const hasUnits = Array.isArray(units) && units.length > 0;
    const hasAccount = typeof account === 'string' && account.length > 0;
    if (!hasUnits && !hasAccount) {
      throw new Error('Either units or account is required when detaching units.');
    }
    return this.executeCadRequest('DETACH_UNIT', { serverId, units: hasUnits ? units : undefined, account: hasAccount ? account : undefined });
  }

  /**
   * Updates the postal code on a call.
   */
  public async setCallPostal(serverId: number, callId: number, postal: string): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId) || !Number.isInteger(callId)) {
      throw new Error('serverId and callId must be integers when setting a call postal.');
    }
    if (!postal) {
      throw new Error('postal is required when setting a call postal.');
    }
    return this.executeCadRequest('SET_CALL_POSTAL', serverId, callId, postal);
  }

  /**
   * Updates a call's primary unit.
   */
  public async setCallPrimary(serverId: number, callId: number, primary: number, trackPrimary: boolean): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId) || !Number.isInteger(callId)) {
      throw new Error('serverId and callId must be integers when setting a call primary.');
    }
    return this.executeCadRequest('SET_CALL_PRIMARY', serverId, callId, primary, trackPrimary);
  }

  /**
   * Adds a note to an active call.
   */
  public async addCallNote(serverId: number, callId: number, note: string, label?: string): Promise<globalTypes.CADStandardResponse>;
  public async addCallNote(serverId: number, callId: number, note: string, noteType: 'text' | 'link', label?: string): Promise<globalTypes.CADStandardResponse>;
  public async addCallNote(params: CADAddCallNoteStruct): Promise<globalTypes.CADStandardResponse>;
  public async addCallNote(
    serverIdOrParams: number | CADAddCallNoteStruct,
    callId?: number,
    note?: string,
    noteTypeOrLabel?: 'text' | 'link' | string,
    label?: string
  ): Promise<globalTypes.CADStandardResponse> {
    let payload: CADAddCallNoteStruct;
    if (serverIdOrParams && typeof serverIdOrParams === 'object') {
      payload = { ...serverIdOrParams };
    } else {
      const isNoteType = noteTypeOrLabel === 'text' || noteTypeOrLabel === 'link';
      payload = {
        serverId: serverIdOrParams as number,
        callId: callId as number,
        note: note as string,
        noteType: isNoteType ? (noteTypeOrLabel as 'text' | 'link') : undefined,
        label: isNoteType ? label : (noteTypeOrLabel as string | undefined)
      };
    }
    const { serverId, callId: resolvedCallId, note: resolvedNote, label: resolvedLabel, noteType } = payload;
    if (!Number.isInteger(serverId) || !Number.isInteger(resolvedCallId)) {
      throw new Error('serverId and callId must be integers when adding a call note.');
    }
    if (!resolvedNote) {
      throw new Error('note is required when adding a call note.');
    }
    return this.executeCadRequest('ADD_CALL_NOTE', { serverId, callId: resolvedCallId, note: resolvedNote, label: resolvedLabel, noteType });
  }

  /**
   * Closes a CAD call.
   */
  public async closeCall(serverId: number, callId: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId) || !Number.isInteger(callId)) {
      throw new Error('serverId and callId must be integers when closing a call.');
    }
    return this.executeCadRequest('CLOSE_CALL', serverId, callId);
  }

  /**
   * Updates live unit locations on the CAD map.
   */
  public async updateUnitLocations(locations: CADUnitLocationStruct[]): Promise<globalTypes.CADStandardResponse> {
    if (!Array.isArray(locations) || locations.length === 0) {
      throw new Error('locations must include at least one entry when updating unit locations.');
    }
    return this.executeCadRequest('UNIT_LOCATION', locations);
  }

  /**
   * Replaces the street sign configuration for a server.
   */
  public async setStreetSignConfig(serverId: number, signConfig: CADStreetSignStruct[]): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when setting street sign config.');
    }
    if (!Array.isArray(signConfig) || signConfig.length === 0) {
      throw new Error('signConfig must include at least one entry when setting street sign config.');
    }
    return this.executeCadRequest('SET_STREETSIGN_CONFIG', serverId, signConfig);
  }

  /**
   * Updates an existing street sign's text.
   */
  public async updateStreetSign(serverId: number, signData: { ids: number[]; text1: string; text2: string; text3: string }): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(serverId)) {
      throw new Error('serverId must be an integer when updating a street sign.');
    }
    if (!signData || !Array.isArray(signData.ids) || signData.ids.length === 0) {
      throw new Error('signData.ids must include at least one identifier when updating a street sign.');
    }
    return this.executeCadRequest('UPDATE_STREETSIGN', serverId, signData);
  }

  private async executeCadV2Request<T = unknown>(
    method: CADV2HttpMethod,
    path: string,
    options: {
      query?: Record<string, unknown>;
      body?: unknown;
      authenticated?: boolean;
    } = {}
  ): Promise<globalTypes.CADStandardResponse<T>> {
    const baseUrl = this.instance.cadApiUrl?.replace(/\/+$/u, '');
    if (!baseUrl) {
      throw new Error('CAD API URL is not configured.');
    }

    const normalizedPath = path.replace(/^\/+/u, '');
    const url = new URL(`${baseUrl}/${normalizedPath}`);
    const { query, body, authenticated = true } = options;

    if (query) {
      Object.entries(query).forEach(([key, value]) => this.appendCadV2QueryValue(url.searchParams, key, value));
    }

    const headers = this.headersInitToRecord(this.instance.apiHeaders);
    headers.Accept = 'application/json';

    if (authenticated) {
      if (!this.instance.cadApiKey) {
        throw new Error('CAD API key is not configured.');
      }
      headers.Authorization = `Bearer ${this.instance.cadApiKey}`;
    }

    const fetchOptions: Record<string, unknown> = {
      method,
      headers
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000).unref();

    try {
      const response = await fetch(url.toString(), {
        ...(fetchOptions as Parameters<typeof fetch>[1]),
        signal: controller.signal as any
      });
      const parsedResponse = await this.parseCadV2Response(response);

      if (response.ok) {
        return { success: true, data: parsedResponse as T };
      }

      return { success: false, reason: parsedResponse };
    } finally {
      clearTimeout(timeout);
    }
  }

  private headersInitToRecord(headersInit: HeadersInit | undefined): Record<string, string> {
    if (!headersInit) {
      return {};
    }
    if (Array.isArray(headersInit)) {
      return Object.fromEntries(headersInit.map(([key, value]) => [key, String(value)]));
    }
    if (typeof Headers !== 'undefined' && headersInit instanceof Headers) {
      return Object.fromEntries(headersInit.entries());
    }
    return Object.fromEntries(Object.entries(headersInit).map(([key, value]) => [key, String(value)]));
  }

  private appendCadV2QueryValue(searchParams: URLSearchParams, key: string, value: unknown): void {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => this.appendCadV2QueryValue(searchParams, key, entry));
      return;
    }
    searchParams.append(key, String(value));
  }

  private async parseCadV2Response(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return null;
    }
    if (response.headers.get('Content-Type')?.startsWith('application/json')) {
      return response.json();
    }
    return response.text();
  }

  private resolveCadServerId(serverId?: number): number {
    return serverId ?? this.instance.cadDefaultServerId;
  }

  private assertPositiveInteger(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`${label} must be a positive integer.`);
    }
  }

  public async getLoginPageV2(params: { url?: string; communityId?: string } = {}): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/general/login-page', {
      authenticated: false,
      query: {
        url: params.url,
        communityId: params.communityId ?? this.instance.cadCommunityId
      }
    });
  }

  public async checkApiIdV2(apiId: string): Promise<globalTypes.CADStandardResponse> {
    if (!apiId) {
      throw new Error('apiId is required.');
    }
    return this.executeCadV2Request('GET', `v2/general/api-ids/${encodeURIComponent(apiId)}`);
  }

  public async applyPermissionKeyV2(data: { apiId: string; permissionKey: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/permission-keys/applications', { body: data });
  }

  public async banUserV2(data: { accountUuid?: string; apiId?: string; isBan?: boolean; isKick?: boolean }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/account-bans', { body: data });
  }

  public async setPenalCodesV2(codes: CADPenalCodeStruct[]): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', 'v2/general/penal-codes', { body: { codes } });
  }

  public async setApiIdsV2(data: { username?: string; accountUuid?: string; apiIds: string[]; sessionId?: string; pushNew?: boolean }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', 'v2/general/api-ids', { body: data });
  }

  public async getTemplatesV2(recordTypeId?: number): Promise<globalTypes.CADStandardResponse> {
    if (recordTypeId !== undefined) {
      this.assertPositiveInteger(recordTypeId, 'recordTypeId');
      return this.executeCadV2Request('GET', `v2/general/templates/${recordTypeId}`);
    }
    return this.executeCadV2Request('GET', 'v2/general/templates');
  }

  public async createRecordV2(data: {
    accountUuid?: string;
    apiId?: string;
    record?: unknown;
    useDictionary?: boolean;
    recordTypeId?: number;
    replaceValues?: Record<string, string>;
    deleteAfterMinutes?: number;
  }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/records', { body: data });
  }

  public async updateRecordV2(
    recordId: number,
    data: {
      accountUuid?: string;
      apiId?: string;
      record?: unknown;
      useDictionary?: boolean;
      templateId?: number;
      replaceValues?: Record<string, string>;
    }
  ): Promise<globalTypes.CADStandardResponse> {
    this.assertPositiveInteger(recordId, 'recordId');
    return this.executeCadV2Request('PATCH', `v2/general/records/${recordId}`, { body: data });
  }

  public async removeRecordV2(recordId: number): Promise<globalTypes.CADStandardResponse> {
    this.assertPositiveInteger(recordId, 'recordId');
    return this.executeCadV2Request('DELETE', `v2/general/records/${recordId}`);
  }

  public async sendRecordDraftV2(data: { recordTypeId: number; replaceValues: Record<string, string>; accountUuid?: string; apiId?: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/record-drafts', { body: data });
  }

  public async lookupV2(data: {
    first: string;
    last: string;
    mi: string;
    plate: string;
    types: number[];
    partial?: boolean;
    agency?: string;
    department?: string;
    subdivision?: string;
    limit?: number;
    offset?: number;
    notifyAccountUuid?: string;
    notifyApiId?: string;
  }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/lookups', { body: data });
  }

  public async lookupByValueV2(data: {
    searchType: string;
    value: string;
    types: number[];
    limit?: number;
    offset?: number;
    notifyAccountUuid?: string;
    notifyApiId?: string;
  }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/lookups/by-value', { body: data });
  }

  public async lookupCustomV2(data: { map: string; value: string; types: number[]; partial?: boolean; limit?: number; offset?: number }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/lookups/custom', { body: data });
  }

  public async getAccountV2(query: { accountUuid?: string; apiId?: string; username?: string } = {}): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/general/accounts/account', { query });
  }

  public async getAccountsV2(query: { limit?: number; offset?: number; status?: string | number; username?: string } = {}): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/general/accounts', { query });
  }

  public async createCommunityLinkV2(data: { communityUserId: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/links', { body: data });
  }

  public async checkCommunityLinkV2(data: { communityUserId: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/links/check', { body: data });
  }

  public async setAccountPermissionsV2(data: {
    accountUuid?: string;
    apiId?: string;
    username?: string;
    active?: boolean;
    add?: string[];
    remove?: string[];
    set?: string[];
    join?: boolean;
  }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PATCH', 'v2/general/accounts/permissions', { body: data });
  }

  public async heartbeatV2(serverId: number | undefined, playerCount: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeCadV2Request('POST', `v2/general/servers/${resolvedServerId}/heartbeat`, { body: { playerCount } });
  }

  public async getVersionV2(): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/general/version');
  }

  public async getServersV2(): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/general/servers');
  }

  public async setServersV2(servers: unknown[], deployMap = false): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', 'v2/general/servers', { body: { servers, deployMap } });
  }

  public async verifySecretV2(secret: string): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/secrets/verify', { body: { secret } });
  }

  public async authorizeStreetSignsV2(serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeCadV2Request('POST', `v2/general/servers/${resolvedServerId}/street-sign-auth`);
  }

  public async setPostalsV2(postals: CADSetPostalStruct[]): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', 'v2/general/postals', { body: { postals } });
  }

  public async sendPhotoV2(data: { apiId: string; url: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', 'v2/general/photos', { body: data });
  }

  public async getInfoV2(): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/general/info');
  }

  public async getCharactersV2(query: { accountUuid?: string; apiId?: string } = {}): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/civilian/characters', { query });
  }

  public async removeCharacterV2(characterId: number): Promise<globalTypes.CADStandardResponse> {
    this.assertPositiveInteger(characterId, 'characterId');
    return this.executeCadV2Request('DELETE', `v2/civilian/characters/${characterId}`);
  }

  public async setSelectedCharacterV2(data: { characterId: string; accountUuid?: string; apiId?: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', 'v2/civilian/selected-character', { body: data });
  }

  public async getCharacterLinksV2(query: { accountUuid?: string; apiId?: string } = {}): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', 'v2/civilian/character-links', { query });
  }

  public async addCharacterLinkV2(syncId: string, data: { accountUuid?: string; apiId?: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', `v2/civilian/character-links/${encodeURIComponent(syncId)}`, { body: data });
  }

  public async removeCharacterLinkV2(syncId: string, data: { accountUuid?: string; apiId?: string }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('DELETE', `v2/civilian/character-links/${encodeURIComponent(syncId)}`, { body: data });
  }

  public async getUnitsV2(query: { serverId?: number; includeOffline?: boolean; onlyUnits?: boolean; limit?: number; offset?: number } = {}): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(query.serverId);
    return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/units`, {
      query: {
        includeOffline: query.includeOffline,
        onlyUnits: query.onlyUnits,
        limit: query.limit,
        offset: query.offset
      }
    });
  }

  public async getCallsV2(query: { serverId?: number; closedLimit?: number; closedOffset?: number; type?: string | number } = {}): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(query.serverId);
    return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/calls`, {
      query: {
        closedLimit: query.closedLimit,
        closedOffset: query.closedOffset,
        type: query.type
      }
    });
  }

  public async getCurrentCallV2(accountUuid: string): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/current-call`);
  }

  public async updateUnitLocationsV2(data: {
    serverId?: number;
    updates: Array<{
      apiId: string;
      location: string;
      coordinates?: unknown;
      position?: unknown;
      peerId?: string;
      vehicle?: unknown;
    }>;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/unit-locations`, {
      body: { updates: data.updates }
    });
  }

  public async setUnitPanicV2(data: {
    serverId?: number;
    accountUuid?: string;
    apiId?: string;
    apiIds?: string[];
    identIds?: number[];
    isPanic: boolean;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/units/panic`, { body });
  }

  public async setUnitStatusV2(data: {
    serverId?: number;
    accountUuid?: string;
    apiId?: string;
    apiIds?: string[];
    identIds?: number[];
    status: string | number;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/units/status`, { body });
  }

  public async kickUnitV2(data: { serverId?: number; apiId: string; reason: string }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/units/kick`, {
      body: {
        apiId: data.apiId,
        reason: data.reason
      }
    });
  }

  public async getIdentifiersV2(accountUuid: string): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('GET', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers`);
  }

  public async getAccountUnitsV2(data: { serverId?: number; accountUuid: string; onlyOnline?: boolean; onlyUnits?: boolean; limit?: number; offset?: number }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/accounts/${encodeURIComponent(data.accountUuid)}/units`, {
      query: {
        onlyOnline: data.onlyOnline,
        onlyUnits: data.onlyUnits,
        limit: data.limit,
        offset: data.offset
      }
    });
  }

  public async selectIdentifierV2(accountUuid: string, identId: number): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('PUT', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/selected-identifier`, {
      body: { identId }
    });
  }

  public async createIdentifierV2(accountUuid: string, data: {
    status?: string | number;
    aop?: string;
    unitNum?: string;
    name?: string;
    district?: string;
    department?: string;
    subdivision?: string;
    rank?: string;
    group?: string;
    page?: string | number;
    isDispatch?: boolean;
  }): Promise<globalTypes.CADStandardResponse> {
    return this.executeCadV2Request('POST', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers`, { body: data });
  }

  public async updateIdentifierV2(accountUuid: string, identId: number, data: {
    status?: string | number;
    aop?: string;
    unitNum?: string;
    name?: string;
    district?: string;
    department?: string;
    subdivision?: string;
    rank?: string;
    group?: string;
    page?: string | number;
    isDispatch?: boolean;
  }): Promise<globalTypes.CADStandardResponse> {
    this.assertPositiveInteger(identId, 'identId');
    return this.executeCadV2Request('PATCH', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers/${identId}`, { body: data });
  }

  public async deleteIdentifierV2(accountUuid: string, identId: number): Promise<globalTypes.CADStandardResponse> {
    this.assertPositiveInteger(identId, 'identId');
    return this.executeCadV2Request('DELETE', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers/${identId}`);
  }

  public async addIdentifiersToGroupV2(data: {
    serverId?: number;
    groupName: string;
    accountUuid?: string;
    apiId?: string;
    apiIds?: string[];
    identIds?: number[];
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const groupName = data.groupName;
    const body = { ...data } as Record<string, unknown>;
    delete body.serverId;
    delete body.groupName;
    return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/identifier-groups/${encodeURIComponent(groupName)}`, { body });
  }

  public async createEmergencyCallV2(data: {
    serverId?: number;
    isEmergency: boolean;
    caller: string;
    location: string;
    description: string;
    deleteAfterMinutes?: number;
    metaData?: Record<string, string>;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/calls/911`, { body });
  }

  public async deleteEmergencyCallV2(callId: number, serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    this.assertPositiveInteger(callId, 'callId');
    return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/calls/911/${callId}`);
  }

  public async createDispatchCallV2(data: {
    serverId?: number;
    origin: string | number;
    status: string | number;
    priority: number;
    block: string;
    address: string;
    postal: string;
    title: string;
    code: string;
    description: string;
    notes: unknown[];
    accounts?: string[];
    apiIds?: string[];
    metaData?: Record<string, string>;
    deleteAfterMinutes?: number;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls`, { body });
  }

  public async updateDispatchCallV2(callId: number, data: {
    serverId?: number;
    origin?: string | number;
    status?: string | number;
    priority?: number;
    block?: string;
    address?: string;
    postal?: string;
    title?: string;
    code?: string;
    description?: string;
    metaData?: Record<string, string>;
    primary?: number;
    trackPrimary?: boolean;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    this.assertPositiveInteger(callId, 'callId');
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}`, { body });
  }

  public async attachUnitsToDispatchCallV2(callId: number, data: {
    serverId?: number;
    groupName?: string;
    accountUuid?: string;
    apiId?: string;
    apiIds?: string[];
    identIds?: number[];
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    this.assertPositiveInteger(callId, 'callId');
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/attachments`, { body });
  }

  public async detachUnitsFromDispatchCallV2(data: {
    serverId?: number;
    groupName?: string;
    accountUuid?: string;
    apiId?: string;
    apiIds?: string[];
    identIds?: number[];
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/attachments`, { body });
  }

  public async setDispatchPostalV2(callId: number, postal: string, serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    this.assertPositiveInteger(callId, 'callId');
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/postal`, {
      body: { postal }
    });
  }

  public async setDispatchPrimaryV2(callId: number, identId: number, trackPrimary = false, serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    this.assertPositiveInteger(callId, 'callId');
    this.assertPositiveInteger(identId, 'identId');
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/primary`, {
      body: { identId, trackPrimary }
    });
  }

  public async addDispatchNoteV2(callId: number, data: { serverId?: number; note: string; noteType?: string; label?: string }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    this.assertPositiveInteger(callId, 'callId');
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/notes`, { body });
  }

  public async closeDispatchCallsV2(callIds: number[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/close`, {
      body: { callIds }
    });
  }

  public async updateStreetSignsV2(data: { serverId?: number; ids: number[]; text1?: string; text2?: string; text3?: string }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/street-signs`, { body });
  }

  public async setStreetSignConfigV2(signs: unknown[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/street-sign-config`, {
      body: { signs }
    });
  }

  public async setAvailableCalloutsV2(callouts: unknown[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/callouts`, {
      body: { callouts }
    });
  }

  public async getPagerConfigV2(serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/pager-config`);
  }

  public async setPagerConfigV2(data: {
    natureWords: unknown;
    maxAddresses: number;
    maxBodyLength: number;
    nodes?: unknown;
    serverId?: number;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/pager-config`, {
      body
    });
  }

  public async setStationsV2(config: unknown, serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/stations`, {
      body: { config }
    });
  }

  public async getBlipsV2(serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/blips`);
  }

  public async createBlipV2(data: {
    serverId?: number;
    coordinates: unknown;
    subType: string;
    icon: string;
    color: string;
    tooltip: string;
    data?: unknown[];
    radius?: number;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/blips`, { body });
  }

  public async updateBlipV2(blipId: number, data: {
    serverId?: number;
    coordinates?: unknown;
    subType?: string;
    icon?: string;
    color?: string;
    tooltip?: string;
    data?: unknown[];
    radius?: number;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(data.serverId);
    this.assertPositiveInteger(blipId, 'blipId');
    const body = { ...data };
    delete body.serverId;
    return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/blips/${blipId}`, { body });
  }

  public async deleteBlipsV2(ids: number[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveCadServerId(serverId);
    return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/blips`, {
      body: { ids }
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
