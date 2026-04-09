"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CADManager = void 0;
const src_1 = require("../libs/rest/src");
const node_fetch_1 = __importDefault(require("node-fetch"));
const node_abort_controller_1 = require("node-abort-controller");
const BaseManager_1 = require("./BaseManager");
const globalTypes = __importStar(require("../constants"));
const CADServerManager_1 = require("./CADServerManager");
/**
 * Manages all Sonoran CAD data and methods to interact with the public API.
 */
class CADManager extends BaseManager_1.BaseManager {
    constructor(instance) {
        super(instance);
        this.ready = false;
        this.version = 0;
        this.failReason = null;
        this.rest = new src_1.REST(instance, this, globalTypes.productEnums.CAD, src_1.DefaultCADRestOptions);
        this.buildManager(instance);
    }
    async buildManager(instance) {
        const mutableThis = this;
        try {
            const version = await this.getVersion();
            mutableThis.version = version;
            if (version >= globalTypes.CADSubscriptionVersionEnum.STANDARD) {
                this.servers = new CADServerManager_1.CADServerManager(instance, this);
            }
            instance.isCADSuccessful = true;
            instance.emit('CAD_SETUP_SUCCESSFUL');
        }
        catch (err) {
            mutableThis.failReason = err;
            instance.emit('CAD_SETUP_UNSUCCESSFUL', err);
            throw err;
        }
    }
    getRest() {
        if (!this.rest) {
            throw new Error('CAD REST client is not initialized.');
        }
        return this.rest;
    }
    async executeCadRequest(type, ...args) {
        try {
            const response = await this.getRest().request(type, ...args);
            return { success: true, data: response };
        }
        catch (err) {
            if (err instanceof src_1.APIError) {
                return { success: false, reason: err.response };
            }
            throw err;
        }
    }
    /**
     * Retrieves the community's CAD subscription version.
     */
    async getVersion() {
        var _a;
        const versionResp = await ((_a = this.rest) === null || _a === void 0 ? void 0 : _a.request('GET_VERSION'));
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
    async getAccount(params) {
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                const getAccountRequest = await ((_a = this.rest) === null || _a === void 0 ? void 0 : _a.request('GET_ACCOUNT', params.apiId, params.username));
                resolve({ success: true, data: getAccountRequest });
            }
            catch (err) {
                if (err instanceof src_1.APIError) {
                    resolve({ success: false, reason: err.response });
                }
                else {
                    reject(err);
                }
            }
        });
    }
    /**
     * Updates the CAD clock to match in-game time.
     */
    async setClockTime(data) {
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                const response = await ((_a = this.rest) === null || _a === void 0 ? void 0 : _a.request('SET_CLOCK', data));
                resolve({ success: true, data: response });
            }
            catch (err) {
                if (err instanceof src_1.APIError) {
                    resolve({ success: false, reason: err.response });
                }
                else {
                    reject(err);
                }
            }
        });
    }
    /**
     * Adds accounts to the community via the join community endpoint.
     * NOTE: This endpoint is intended for internal CMS use and requires an internal key.
     */
    async joinCommunity(internalKey, accounts) {
        if (!internalKey) {
            throw new Error('internalKey is required to join a community.');
        }
        const normalizedAccounts = this.normalizeAccountEntries(accounts);
        if (normalizedAccounts.length === 0) {
            throw new Error('At least one account must be provided to join the community.');
        }
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                const response = await ((_a = this.rest) === null || _a === void 0 ? void 0 : _a.request('JOIN_COMMUNITY', { internalKey, accounts: normalizedAccounts }));
                resolve({ success: true, data: response });
            }
            catch (err) {
                if (err instanceof src_1.APIError) {
                    resolve({ success: false, reason: err.response });
                }
                else {
                    reject(err);
                }
            }
        });
    }
    /**
     * Removes accounts from the community via the leave community endpoint.
     * NOTE: This endpoint is intended for internal CMS use and requires an internal key.
     */
    async leaveCommunity(internalKey, accounts) {
        if (!internalKey) {
            throw new Error('internalKey is required to leave a community.');
        }
        const normalizedAccounts = this.normalizeAccountEntries(accounts);
        if (normalizedAccounts.length === 0) {
            throw new Error('At least one account must be provided to leave the community.');
        }
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                const response = await ((_a = this.rest) === null || _a === void 0 ? void 0 : _a.request('LEAVE_COMMUNITY', { internalKey, accounts: normalizedAccounts }));
                resolve({ success: true, data: response });
            }
            catch (err) {
                if (err instanceof src_1.APIError) {
                    resolve({ success: false, reason: err.response });
                }
                else {
                    reject(err);
                }
            }
        });
    }
    /**
     * Updates the penal code configuration for the community.
     */
    async setPenalCodes(codes) {
        if (!Array.isArray(codes) || codes.length === 0) {
            throw new Error('codes array must include at least one penal code entry.');
        }
        return this.executeCadRequest('SET_PENAL_CODES', codes);
    }
    /**
     * Assigns API IDs to a community account.
     */
    async setAccountApiIds(data) {
        if (!(data === null || data === void 0 ? void 0 : data.username) || !Array.isArray(data.apiIds)) {
            throw new Error('username and apiIds are required to set account API IDs.');
        }
        return this.executeCadRequest('SET_API_ID', data);
    }
    /**
     * Retrieves record templates filtered by a specific record type.
     */
    async getRecordTemplates(recordTypeId) {
        if (typeof recordTypeId === 'number') {
            return this.executeCadRequest('GET_TEMPLATES', recordTypeId);
        }
        return this.executeCadRequest('GET_TEMPLATES');
    }
    /**
     * Creates a new record entry.
     */
    async createRecord(data) {
        return this.executeCadRequest('NEW_RECORD', data);
    }
    /**
     * Sends a record draft with populated fields.
     */
    async sendDraft(data) {
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
    async updateRecord(data) {
        return this.executeCadRequest('EDIT_RECORD', data);
    }
    /**
     * Removes a record by its identifier.
     */
    async removeRecord(id) {
        if (!Number.isInteger(id)) {
            throw new Error('id must be an integer when removing a record.');
        }
        return this.executeCadRequest('REMOVE_RECORD', id);
    }
    /**
     * Performs an internal lookup using the CAD lookup by identifier endpoint.
     */
    async lookupByInt(data) {
        if (!data || !('searchType' in data) || !('value' in data)) {
            throw new Error('searchType and value are required for lookupByInt.');
        }
        return this.executeCadRequest('LOOKUP_INT', data);
    }
    /**
     * Executes a CAD lookup using first/last name, plate, or other values.
     * Supports identifying the requester via `apiId` or `account` (UUID).
     */
    async lookupRecords(data) {
        return this.executeCadRequest('LOOKUP', data);
    }
    /**
     * Checks whether the provided API ID exists.
     */
    async checkApiId(apiId) {
        if (!apiId) {
            throw new Error('apiId is required to check for existence.');
        }
        return this.executeCadRequest('CHECK_APIID', apiId);
    }
    /**
     * Applies a permission key to an account.
     */
    async applyPermissionKey(apiId, permissionKey) {
        if (!permissionKey) {
            throw new Error('permissionKey is required when applying a permission key.');
        }
        return this.executeCadRequest('APPLY_PERMISSION_KEY', apiId, permissionKey);
    }
    /**
     * Sets account permissions for a CAD user.
     */
    async setAccountPermissions(data) {
        if (!data || (!Array.isArray(data.add) && !Array.isArray(data.remove))) {
            throw new Error('At least one permission change is required.');
        }
        return this.executeCadRequest('SET_ACCOUNT_PERMISSIONS', data);
    }
    /**
     * Bans or kicks a CAD user.
     */
    async banUser(data) {
        if (!(data === null || data === void 0 ? void 0 : data.apiId)) {
            throw new Error('apiId is required when banning or kicking a user.');
        }
        return this.executeCadRequest('BAN_USER', data);
    }
    /**
     * Verifies a secret string against CAD configuration.
     */
    async verifySecret(secret) {
        if (!secret) {
            throw new Error('secret is required to verify.');
        }
        return this.executeCadRequest('VERIFY_SECRET', secret);
    }
    /**
     * Authorizes street sign changes for a CAD server.
     */
    async authorizeStreetSigns(serverId) {
        if (!Number.isInteger(serverId)) {
            throw new Error('serverId must be an integer when authorizing street signs.');
        }
        return this.executeCadRequest('AUTH_STREETSIGNS', serverId);
    }
    /**
     * Replaces the community postal list.
     */
    async setPostals(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('data must include at least one postal entry.');
        }
        return this.executeCadRequest('SET_POSTALS', data);
    }
    /**
     * Sends a photo to CAD for the provided API ID.
     */
    async sendPhoto(apiId, url) {
        if (!url) {
            throw new Error('url is required to send a CAD photo.');
        }
        return this.executeCadRequest('SEND_PHOTO', apiId, url);
    }
    /**
     * Retrieves characters belonging to an API ID.
     */
    async getCharacters(apiId) {
        if (!apiId) {
            throw new Error('apiId is required to fetch characters.');
        }
        return this.executeCadRequest('GET_CHARACTERS', apiId);
    }
    /**
     * Creates a new civilian character.
     */
    async createCharacter(data) {
        return this.executeCadRequest('NEW_CHARACTER', data);
    }
    /**
     * Updates an existing civilian character.
     */
    async updateCharacter(data) {
        return this.executeCadRequest('EDIT_CHARACTER', data);
    }
    /**
     * Removes a civilian character by identifier.
     */
    async removeCharacter(id) {
        if (!Number.isInteger(id)) {
            throw new Error('id must be an integer when removing a character.');
        }
        return this.executeCadRequest('REMOVE_CHARACTER', id);
    }
    /**
     * Retrieves identifiers assigned to an API ID.
     */
    async getIdentifiers(apiId) {
        if (!apiId) {
            throw new Error('apiId is required to fetch identifiers.');
        }
        return this.executeCadRequest('GET_IDENTIFIERS', apiId);
    }
    /**
     * Modifies identifiers for an account.
     */
    async modifyIdentifier(data) {
        if (!(data === null || data === void 0 ? void 0 : data.apiId)) {
            throw new Error('apiId is required when modifying an identifier.');
        }
        return this.executeCadRequest('MODIFY_IDENTIFIER', data);
    }
    /**
     * Sets the active identifier by identifier ID.
     */
    async setIdentifier(apiId, identId) {
        if (!Number.isInteger(identId)) {
            throw new Error('identId must be an integer when setting an identifier.');
        }
        return this.executeCadRequest('SET_IDENTIFIER', apiId, identId);
    }
    /**
     * Assigns identifiers to a group name.
     */
    async setIdentifiersToGroup(entries) {
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
    async setUnitPanic(apiIdOrParams, isPanic, identIds) {
        let payload;
        if (apiIdOrParams && typeof apiIdOrParams === 'object') {
            payload = { ...apiIdOrParams };
        }
        else {
            payload = { apiId: apiIdOrParams, isPanic: isPanic, identIds };
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
    async setUnitStatus(apiIdOrParams, status, serverId, identIds) {
        let payload;
        if (apiIdOrParams && typeof apiIdOrParams === 'object' && !Array.isArray(apiIdOrParams)) {
            payload = {
                apiId: apiIdOrParams.apiId,
                account: apiIdOrParams.account,
                status: apiIdOrParams.status,
                serverId: apiIdOrParams.serverId,
                identIds: apiIdOrParams.identIds
            };
        }
        else {
            payload = { apiId: apiIdOrParams, status: status, serverId: serverId, identIds };
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
    async getBlips(serverId) {
        if (!Number.isInteger(serverId)) {
            throw new Error('serverId must be an integer when retrieving blips.');
        }
        return this.executeCadRequest('GET_BLIPS', serverId);
    }
    /**
     * Adds blips to the CAD map.
     */
    async addBlips(blips) {
        const payload = Array.isArray(blips) ? blips : [blips];
        if (payload.length === 0) {
            throw new Error('At least one blip must be provided when adding blips.');
        }
        return this.executeCadRequest('ADD_BLIP', payload);
    }
    /**
     * Updates existing CAD map blips.
     */
    async updateBlips(blips) {
        const payload = Array.isArray(blips) ? blips : [blips];
        if (payload.length === 0) {
            throw new Error('At least one blip must be provided when updating blips.');
        }
        return this.executeCadRequest('MODIFY_BLIP', payload);
    }
    /**
     * Removes a CAD map blip.
     */
    async removeBlip(id) {
        if (!Number.isInteger(id)) {
            throw new Error('id must be an integer when removing a blip.');
        }
        return this.executeCadRequest('REMOVE_BLIP', id);
    }
    /**
     * Creates a new 911 call entry.
     */
    async create911Call(params) {
        const { serverId, isEmergency, caller, location, description, metaData = {} } = params;
        if (!Number.isInteger(serverId)) {
            throw new Error('serverId must be an integer when creating a 911 call.');
        }
        return this.executeCadRequest('911_CALL', serverId, isEmergency, caller, location, description, metaData);
    }
    async remove911Call(serverIdOrParams, callId) {
        let payload;
        if (serverIdOrParams && typeof serverIdOrParams === 'object') {
            payload = { ...serverIdOrParams };
        }
        else {
            payload = { serverId: serverIdOrParams, callId: callId };
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
    async getCalls(options) {
        return this.executeCadRequest('GET_CALLS', options);
    }
    /**
     * Retrieves the current call associated with the given account UUID.
     */
    async getMyCall(options) {
        if (!(options === null || options === void 0 ? void 0 : options.account)) {
            throw new Error('account is required when fetching current call.');
        }
        return this.executeCadRequest('GET_MY_CALL', options);
    }
    /**
     * Retrieves active units for the provided filters.
     */
    async getActiveUnits(options) {
        return this.executeCadRequest('GET_ACTIVE_UNITS', options);
    }
    /**
     * Kicks an active unit from the CAD.
     */
    async kickUnit(apiId, reason, serverId) {
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
    async createDispatch(data) {
        const hasUnits = Array.isArray(data.units);
        const hasAccounts = Array.isArray(data.accounts);
        const payload = {
            ...data,
            ...(hasUnits ? { units: data.units } : {}),
            ...(hasAccounts ? { accounts: data.accounts } : {})
        };
        return this.executeCadRequest('NEW_DISPATCH', payload);
    }
    /**
     * Edits an existing dispatch call.
     */
    async editDispatch(data) {
        if (!Number.isInteger(data.serverId) || !Number.isInteger(data.callId)) {
            throw new Error('serverId and callId must be integers when editing a dispatch call.');
        }
        const { serverId, callId, ...updates } = data;
        if (!Object.values(updates).some((value) => value !== undefined)) {
            throw new Error('At least one dispatch field must be provided when editing a dispatch call.');
        }
        return this.executeCadRequest('EDIT_DISPATCH', data);
    }
    async attachUnits(serverIdOrParams, callId, unitsOrAccount, identIds) {
        let payload;
        if (serverIdOrParams && typeof serverIdOrParams === 'object') {
            payload = { ...serverIdOrParams };
        }
        else {
            payload = {
                serverId: serverIdOrParams,
                callId: callId,
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
    async detachUnits(serverIdOrParams, unitsOrAccount) {
        let payload;
        if (serverIdOrParams && typeof serverIdOrParams === 'object') {
            payload = { ...serverIdOrParams };
        }
        else {
            payload = {
                serverId: serverIdOrParams,
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
    async setCallPostal(serverId, callId, postal) {
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
    async setCallPrimary(serverId, callId, primary, trackPrimary) {
        if (!Number.isInteger(serverId) || !Number.isInteger(callId)) {
            throw new Error('serverId and callId must be integers when setting a call primary.');
        }
        return this.executeCadRequest('SET_CALL_PRIMARY', serverId, callId, primary, trackPrimary);
    }
    async addCallNote(serverIdOrParams, callId, note, noteTypeOrLabel, label) {
        let payload;
        if (serverIdOrParams && typeof serverIdOrParams === 'object') {
            payload = { ...serverIdOrParams };
        }
        else {
            const isNoteType = noteTypeOrLabel === 'text' || noteTypeOrLabel === 'link';
            payload = {
                serverId: serverIdOrParams,
                callId: callId,
                note: note,
                noteType: isNoteType ? noteTypeOrLabel : undefined,
                label: isNoteType ? label : noteTypeOrLabel
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
    async closeCall(serverId, callId) {
        if (!Number.isInteger(serverId) || !Number.isInteger(callId)) {
            throw new Error('serverId and callId must be integers when closing a call.');
        }
        return this.executeCadRequest('CLOSE_CALL', serverId, callId);
    }
    /**
     * Updates live unit locations on the CAD map.
     */
    async updateUnitLocations(locations) {
        if (!Array.isArray(locations) || locations.length === 0) {
            throw new Error('locations must include at least one entry when updating unit locations.');
        }
        return this.executeCadRequest('UNIT_LOCATION', locations);
    }
    /**
     * Replaces the street sign configuration for a server.
     */
    async setStreetSignConfig(serverId, signConfig) {
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
    async updateStreetSign(serverId, signData) {
        if (!Number.isInteger(serverId)) {
            throw new Error('serverId must be an integer when updating a street sign.');
        }
        if (!signData || !Array.isArray(signData.ids) || signData.ids.length === 0) {
            throw new Error('signData.ids must include at least one identifier when updating a street sign.');
        }
        return this.executeCadRequest('UPDATE_STREETSIGN', serverId, signData);
    }
    async executeCadV2Request(method, path, options = {}) {
        var _a;
        const baseUrl = (_a = this.instance.cadApiUrl) === null || _a === void 0 ? void 0 : _a.replace(/\/+$/u, '');
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
        const fetchOptions = {
            method,
            headers
        };
        if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(body);
        }
        const controller = new node_abort_controller_1.AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000).unref();
        try {
            const response = await (0, node_fetch_1.default)(url.toString(), {
                ...fetchOptions,
                signal: controller.signal
            });
            const parsedResponse = await this.parseCadV2Response(response);
            if (response.ok) {
                return { success: true, data: parsedResponse };
            }
            return { success: false, reason: parsedResponse };
        }
        finally {
            clearTimeout(timeout);
        }
    }
    headersInitToRecord(headersInit) {
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
    appendCadV2QueryValue(searchParams, key, value) {
        if (value === undefined || value === null) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((entry) => this.appendCadV2QueryValue(searchParams, key, entry));
            return;
        }
        searchParams.append(key, String(value));
    }
    async parseCadV2Response(response) {
        var _a;
        if (response.status === 204) {
            return null;
        }
        if ((_a = response.headers.get('Content-Type')) === null || _a === void 0 ? void 0 : _a.startsWith('application/json')) {
            return response.json();
        }
        return response.text();
    }
    resolveCadServerId(serverId) {
        return serverId !== null && serverId !== void 0 ? serverId : this.instance.cadDefaultServerId;
    }
    assertPositiveInteger(value, label) {
        if (!Number.isInteger(value) || value < 1) {
            throw new Error(`${label} must be a positive integer.`);
        }
    }
    async getLoginPageV2(params = {}) {
        var _a;
        return this.executeCadV2Request('GET', 'v2/general/login-page', {
            authenticated: false,
            query: {
                url: params.url,
                communityId: (_a = params.communityId) !== null && _a !== void 0 ? _a : this.instance.cadCommunityId
            }
        });
    }
    async checkApiIdV2(apiId) {
        if (!apiId) {
            throw new Error('apiId is required.');
        }
        return this.executeCadV2Request('GET', `v2/general/api-ids/${encodeURIComponent(apiId)}`);
    }
    async applyPermissionKeyV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/permission-keys/applications', { body: data });
    }
    async banUserV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/account-bans', { body: data });
    }
    async setPenalCodesV2(codes) {
        return this.executeCadV2Request('PUT', 'v2/general/penal-codes', { body: { codes } });
    }
    async setApiIdsV2(data) {
        return this.executeCadV2Request('PUT', 'v2/general/api-ids', { body: data });
    }
    async getTemplatesV2(recordTypeId) {
        if (recordTypeId !== undefined) {
            this.assertPositiveInteger(recordTypeId, 'recordTypeId');
            return this.executeCadV2Request('GET', `v2/general/templates/${recordTypeId}`);
        }
        return this.executeCadV2Request('GET', 'v2/general/templates');
    }
    async createRecordV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/records', { body: data });
    }
    async updateRecordV2(recordId, data) {
        this.assertPositiveInteger(recordId, 'recordId');
        return this.executeCadV2Request('PATCH', `v2/general/records/${recordId}`, { body: data });
    }
    async removeRecordV2(recordId) {
        this.assertPositiveInteger(recordId, 'recordId');
        return this.executeCadV2Request('DELETE', `v2/general/records/${recordId}`);
    }
    async sendRecordDraftV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/record-drafts', { body: data });
    }
    async lookupV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/lookups', { body: data });
    }
    async lookupByValueV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/lookups/by-value', { body: data });
    }
    async lookupCustomV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/lookups/custom', { body: data });
    }
    async getAccountV2(query = {}) {
        return this.executeCadV2Request('GET', 'v2/general/accounts/account', { query });
    }
    async getAccountsV2(query = {}) {
        return this.executeCadV2Request('GET', 'v2/general/accounts', { query });
    }
    async setAccountPermissionsV2(data) {
        return this.executeCadV2Request('PATCH', 'v2/general/accounts/permissions', { body: data });
    }
    async heartbeatV2(serverId, playerCount) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        this.assertPositiveInteger(resolvedServerId, 'serverId');
        return this.executeCadV2Request('POST', `v2/general/servers/${resolvedServerId}/heartbeat`, { body: { playerCount } });
    }
    async getVersionV2() {
        return this.executeCadV2Request('GET', 'v2/general/version');
    }
    async getServersV2() {
        return this.executeCadV2Request('GET', 'v2/general/servers');
    }
    async setServersV2(servers, deployMap = false) {
        return this.executeCadV2Request('PUT', 'v2/general/servers', { body: { servers, deployMap } });
    }
    async verifySecretV2(secret) {
        return this.executeCadV2Request('POST', 'v2/general/secrets/verify', { body: { secret } });
    }
    async authorizeStreetSignsV2(serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        this.assertPositiveInteger(resolvedServerId, 'serverId');
        return this.executeCadV2Request('POST', `v2/general/servers/${resolvedServerId}/street-sign-auth`);
    }
    async setPostalsV2(postals) {
        return this.executeCadV2Request('PUT', 'v2/general/postals', { body: { postals } });
    }
    async sendPhotoV2(data) {
        return this.executeCadV2Request('POST', 'v2/general/photos', { body: data });
    }
    async getInfoV2() {
        return this.executeCadV2Request('GET', 'v2/general/info');
    }
    async getCharactersV2(query = {}) {
        return this.executeCadV2Request('GET', 'v2/civilian/characters', { query });
    }
    async removeCharacterV2(characterId) {
        this.assertPositiveInteger(characterId, 'characterId');
        return this.executeCadV2Request('DELETE', `v2/civilian/characters/${characterId}`);
    }
    async setSelectedCharacterV2(data) {
        return this.executeCadV2Request('PUT', 'v2/civilian/selected-character', { body: data });
    }
    async getCharacterLinksV2(query = {}) {
        return this.executeCadV2Request('GET', 'v2/civilian/character-links', { query });
    }
    async addCharacterLinkV2(syncId, data) {
        return this.executeCadV2Request('PUT', `v2/civilian/character-links/${encodeURIComponent(syncId)}`, { body: data });
    }
    async removeCharacterLinkV2(syncId, data) {
        return this.executeCadV2Request('DELETE', `v2/civilian/character-links/${encodeURIComponent(syncId)}`, { body: data });
    }
    async getUnitsV2(query = {}) {
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
    async getCallsV2(query = {}) {
        const resolvedServerId = this.resolveCadServerId(query.serverId);
        return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/calls`, {
            query: {
                closedLimit: query.closedLimit,
                closedOffset: query.closedOffset,
                type: query.type
            }
        });
    }
    async getCurrentCallV2(accountUuid) {
        return this.executeCadV2Request('GET', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/current-call`);
    }
    async updateUnitLocationsV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/unit-locations`, {
            body: { updates: data.updates }
        });
    }
    async setUnitPanicV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/units/panic`, { body });
    }
    async setUnitStatusV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/units/status`, { body });
    }
    async kickUnitV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/units/kick`, {
            body: {
                apiId: data.apiId,
                reason: data.reason
            }
        });
    }
    async getIdentifiersV2(accountUuid) {
        return this.executeCadV2Request('GET', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers`);
    }
    async getAccountUnitsV2(data) {
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
    async selectIdentifierV2(accountUuid, identId) {
        return this.executeCadV2Request('PUT', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/selected-identifier`, {
            body: { identId }
        });
    }
    async createIdentifierV2(accountUuid, data) {
        return this.executeCadV2Request('POST', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers`, { body: data });
    }
    async updateIdentifierV2(accountUuid, identId, data) {
        this.assertPositiveInteger(identId, 'identId');
        return this.executeCadV2Request('PATCH', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers/${identId}`, { body: data });
    }
    async deleteIdentifierV2(accountUuid, identId) {
        this.assertPositiveInteger(identId, 'identId');
        return this.executeCadV2Request('DELETE', `v2/emergency/accounts/${encodeURIComponent(accountUuid)}/identifiers/${identId}`);
    }
    async addIdentifiersToGroupV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const groupName = data.groupName;
        const body = { ...data };
        delete body.serverId;
        delete body.groupName;
        return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/identifier-groups/${encodeURIComponent(groupName)}`, { body });
    }
    async createEmergencyCallV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/calls/911`, { body });
    }
    async deleteEmergencyCallV2(callId, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        this.assertPositiveInteger(callId, 'callId');
        return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/calls/911/${callId}`);
    }
    async createDispatchCallV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls`, { body });
    }
    async updateDispatchCallV2(callId, data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        this.assertPositiveInteger(callId, 'callId');
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}`, { body });
    }
    async attachUnitsToDispatchCallV2(callId, data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        this.assertPositiveInteger(callId, 'callId');
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/attachments`, { body });
    }
    async detachUnitsFromDispatchCallV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/attachments`, { body });
    }
    async setDispatchPostalV2(callId, postal, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        this.assertPositiveInteger(callId, 'callId');
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/postal`, {
            body: { postal }
        });
    }
    async setDispatchPrimaryV2(callId, identId, trackPrimary = false, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        this.assertPositiveInteger(callId, 'callId');
        this.assertPositiveInteger(identId, 'identId');
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/primary`, {
            body: { identId, trackPrimary }
        });
    }
    async addDispatchNoteV2(callId, data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        this.assertPositiveInteger(callId, 'callId');
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/${callId}/notes`, { body });
    }
    async closeDispatchCallsV2(callIds, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/dispatch-calls/close`, {
            body: { callIds }
        });
    }
    async updateStreetSignsV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/street-signs`, { body });
    }
    async setStreetSignConfigV2(signs, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/street-sign-config`, {
            body: { signs }
        });
    }
    async setAvailableCalloutsV2(callouts, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/callouts`, {
            body: { callouts }
        });
    }
    async triggerPagerSystemV2(callout, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/callouts/trigger`, {
            body: { callout }
        });
    }
    async setStationsV2(config, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('PUT', `v2/emergency/servers/${resolvedServerId}/stations`, {
            body: { config }
        });
    }
    async triggerStationAlertV2(alert, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/stations/alert`, {
            body: { alert }
        });
    }
    async getBlipsV2(serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('GET', `v2/emergency/servers/${resolvedServerId}/blips`);
    }
    async createBlipV2(data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('POST', `v2/emergency/servers/${resolvedServerId}/blips`, { body });
    }
    async updateBlipV2(blipId, data) {
        const resolvedServerId = this.resolveCadServerId(data.serverId);
        this.assertPositiveInteger(blipId, 'blipId');
        const body = { ...data };
        delete body.serverId;
        return this.executeCadV2Request('PATCH', `v2/emergency/servers/${resolvedServerId}/blips/${blipId}`, { body });
    }
    async deleteBlipsV2(ids, serverId) {
        const resolvedServerId = this.resolveCadServerId(serverId);
        return this.executeCadV2Request('DELETE', `v2/emergency/servers/${resolvedServerId}/blips`, {
            body: { ids }
        });
    }
    normalizeAccountEntries(input) {
        const entries = Array.isArray(input) ? input : [input];
        return entries
            .filter((entry) => entry !== undefined && entry !== null)
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
exports.CADManager = CADManager;
