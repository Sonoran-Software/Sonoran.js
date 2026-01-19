import { Instance } from '../instance/Instance';
import { CADSubscriptionVersionEnum } from '../constants';
import { APIError, DefaultCADRestOptions, REST } from '../libs/rest/src';
import type {
  RESTTypedAPIDataStructs,
  CADPenalCodeStruct,
  CADSetAPIIDStruct,
  CADNewEditRecordOptionOneStruct,
  CADNewEditRecordOptionTwoStruct,
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
  CADGetActiveUnitsStruct,
  CADNewDispatchStruct,
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
  public async setUnitPanic(apiId: string | undefined, isPanic: boolean): Promise<globalTypes.CADStandardResponse>;
  public async setUnitPanic(params: CADUnitPanicStruct): Promise<globalTypes.CADStandardResponse>;
  public async setUnitPanic(apiIdOrParams: string | CADUnitPanicStruct | undefined, isPanic?: boolean): Promise<globalTypes.CADStandardResponse> {
    let payload: CADUnitPanicStruct;
    if (apiIdOrParams && typeof apiIdOrParams === 'object') {
      payload = { ...apiIdOrParams };
    } else {
      payload = { apiId: apiIdOrParams as string | undefined, isPanic: isPanic as boolean };
    }
    const { apiId, account, isPanic: resolvedPanic } = payload;
    if (resolvedPanic === undefined) {
      throw new Error('isPanic is required when setting unit panic.');
    }
    if (!apiId && !account) {
      throw new Error('Either apiId or account is required when setting unit panic.');
    }
    return this.executeCadRequest('UNIT_PANIC', { apiId, account, isPanic: resolvedPanic });
  }

  /**
   * Updates a unit's status.
   */
  public async setUnitStatus(apiId: string | undefined, status: number, serverId: number): Promise<globalTypes.CADStandardResponse>;
  public async setUnitStatus(params: { apiId?: string; account?: string; status: number; serverId: number }): Promise<globalTypes.CADStandardResponse>;
  public async setUnitStatus(
    apiIdOrParams: string | undefined | { apiId?: string; account?: string; status: number; serverId: number },
    status?: number,
    serverId?: number
  ): Promise<globalTypes.CADStandardResponse> {
    let payload: CADUnitStatusStruct;
    if (apiIdOrParams && typeof apiIdOrParams === 'object' && !Array.isArray(apiIdOrParams)) {
      payload = {
        apiId: apiIdOrParams.apiId,
        account: apiIdOrParams.account,
        status: apiIdOrParams.status,
        serverId: apiIdOrParams.serverId
      };
    } else {
      payload = { apiId: apiIdOrParams as string | undefined, status: status as number, serverId: serverId as number };
    }
    const { apiId, account, status: resolvedStatus, serverId: resolvedServerId } = payload;
    if (!Number.isInteger(resolvedServerId)) {
      throw new Error('serverId must be an integer when updating unit status.');
    }
    if (resolvedStatus === undefined) {
      throw new Error('status is required when updating unit status.');
    }
    if (!apiId && !account) {
      throw new Error('Either apiId or account is required when updating unit status.');
    }
    return this.executeCadRequest('UNIT_STATUS', { apiId, account, status: resolvedStatus, serverId: resolvedServerId });
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
  public async remove911Call(callId: number): Promise<globalTypes.CADStandardResponse> {
    if (!Number.isInteger(callId)) {
      throw new Error('callId must be an integer when removing a 911 call.');
    }
    return this.executeCadRequest('REMOVE_911', callId);
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
  public async createDispatch(data: CADNewDispatchStruct): Promise<globalTypes.CADStandardResponse> {
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
   * Attaches units to an existing dispatch call.
   */
  public async attachUnits(serverId: number, callId: number, unitsOrAccount: string[] | string): Promise<globalTypes.CADStandardResponse>;
  public async attachUnits(params: CADAttachUnitsStruct): Promise<globalTypes.CADStandardResponse>;
  public async attachUnits(
    serverIdOrParams: number | CADAttachUnitsStruct,
    callId?: number,
    unitsOrAccount?: string[] | string
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
            : {})
      };
    }

    const { serverId, callId: resolvedCallId, units, account } = payload;
    if (!Number.isInteger(serverId) || !Number.isInteger(resolvedCallId)) {
      throw new Error('serverId and callId must be integers when attaching units.');
    }
    const hasUnits = Array.isArray(units) && units.length > 0;
    const hasAccount = typeof account === 'string' && account.length > 0;
    if (!hasUnits && !hasAccount) {
      throw new Error('Either units or account is required when attaching units.');
    }
    return this.executeCadRequest('ATTACH_UNIT', { serverId, callId: resolvedCallId, units: hasUnits ? units : undefined, account: hasAccount ? account : undefined });
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
  public async addCallNote(params: CADAddCallNoteStruct): Promise<globalTypes.CADStandardResponse>;
  public async addCallNote(
    serverIdOrParams: number | CADAddCallNoteStruct,
    callId?: number,
    note?: string,
    label?: string
  ): Promise<globalTypes.CADStandardResponse> {
    let payload: CADAddCallNoteStruct;
    if (serverIdOrParams && typeof serverIdOrParams === 'object') {
      payload = { ...serverIdOrParams };
    } else {
      payload = { serverId: serverIdOrParams as number, callId: callId as number, note: note as string, label };
    }
    const { serverId, callId: resolvedCallId, note: resolvedNote, label: resolvedLabel } = payload;
    if (!Number.isInteger(serverId) || !Number.isInteger(resolvedCallId)) {
      throw new Error('serverId and callId must be integers when adding a call note.');
    }
    if (!resolvedNote) {
      throw new Error('note is required when adding a call note.');
    }
    return this.executeCadRequest('ADD_CALL_NOTE', { serverId, callId: resolvedCallId, note: resolvedNote, label: resolvedLabel });
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
