import { Instance } from '../instance/Instance';
import { CADSubscriptionVersionEnum } from '../constants';
import { REST } from '../libs/rest/src';
import type { CADPenalCodeStruct, CADSetAPIIDStruct, CADNewEditRecordOptionOneStruct, CADNewEditRecordOptionTwoStruct, CADSendDraftStruct, CADLookupByIntStruct, CADLookupStruct, CADModifyAccountPermsStruct, CADKickBanUserStruct, CADSetPostalStruct, CADModifyIdentifierStruct, CADIdentsToGroupStruct, CADAddBlipStruct, CADModifyBlipStruct, CADGetCallsStruct, CADGetMyCallStruct, CADAddCallNoteStruct, CADRemove911Struct, CADGetActiveUnitsStruct, CADNewDispatchStruct, CADEditDispatchStruct, CADAttachUnitsStruct, CADDetachUnitsStruct, CADStreetSignStruct, CADUnitLocationStruct, CADUnitPanicStruct } from '../libs/rest/src';
import { BaseManager } from './BaseManager';
import * as globalTypes from '../constants';
import { CADServerManager } from './CADServerManager';
/**
 * Manages all Sonoran CAD data and methods to interact with the public API.
 */
export declare class CADManager extends BaseManager {
    readonly ready = false;
    readonly version: CADSubscriptionVersionEnum;
    readonly failReason: unknown;
    rest: REST | undefined;
    servers: CADServerManager | undefined;
    constructor(instance: Instance);
    protected buildManager(instance: Instance): Promise<void>;
    private getRest;
    private executeCadRequest;
    /**
     * Retrieves the community's CAD subscription version.
     */
    getVersion(): Promise<number>;
    /**
     * Gets a community account by `accId` or `apiId`.
     * @param {Object} params The object that contains parameters to get a community account.
     * @param {string} [data.accId] The account id to find a community account.
     * @param {string} [data.apiId] The api id to find a community account.
     * @returns {Promise} Promise object represents if the request was successful with reason for failure if needed and the account data object if found.
     */
    getAccount(params: {
        apiId?: string;
        username?: string;
    }): Promise<globalTypes.CADGetAccountPromiseResult>;
    /**
     * Updates the CAD clock to match in-game time.
     */
    setClockTime(data: {
        serverId: number;
        currentUtc: string;
        currentGame: string;
        secondsPerHour: number;
    }): Promise<globalTypes.CADSetClockTimePromiseResult>;
    /**
     * Adds accounts to the community via the join community endpoint.
     * NOTE: This endpoint is intended for internal CMS use and requires an internal key.
     */
    joinCommunity(internalKey: string, accounts: string | {
        account: string;
    } | Array<string | {
        account: string;
    }>): Promise<globalTypes.CADJoinCommunityPromiseResult>;
    /**
     * Removes accounts from the community via the leave community endpoint.
     * NOTE: This endpoint is intended for internal CMS use and requires an internal key.
     */
    leaveCommunity(internalKey: string, accounts: string | {
        account: string;
    } | Array<string | {
        account: string;
    }>): Promise<globalTypes.CADLeaveCommunityPromiseResult>;
    /**
     * Updates the penal code configuration for the community.
     */
    setPenalCodes(codes: CADPenalCodeStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Assigns API IDs to a community account.
     */
    setAccountApiIds(data: CADSetAPIIDStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves record templates filtered by a specific record type.
     */
    getRecordTemplates(recordTypeId?: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Creates a new record entry.
     */
    createRecord(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Sends a record draft with populated fields.
     */
    sendDraft(data: CADSendDraftStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates an existing record entry.
     */
    updateRecord(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Removes a record by its identifier.
     */
    removeRecord(id: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Performs an internal lookup using the CAD lookup by identifier endpoint.
     */
    lookupByInt(data: CADLookupByIntStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Executes a CAD lookup using first/last name, plate, or other values.
     * Supports identifying the requester via `apiId` or `account` (UUID).
     */
    lookupRecords(data: CADLookupStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Checks whether the provided API ID exists.
     */
    checkApiId(apiId: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Applies a permission key to an account.
     */
    applyPermissionKey(apiId: string | undefined, permissionKey: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Sets account permissions for a CAD user.
     */
    setAccountPermissions(data: CADModifyAccountPermsStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Bans or kicks a CAD user.
     */
    banUser(data: CADKickBanUserStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Verifies a secret string against CAD configuration.
     */
    verifySecret(secret: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Authorizes street sign changes for a CAD server.
     */
    authorizeStreetSigns(serverId: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Replaces the community postal list.
     */
    setPostals(data: CADSetPostalStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Sends a photo to CAD for the provided API ID.
     */
    sendPhoto(apiId: string | undefined, url: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves characters belonging to an API ID.
     */
    getCharacters(apiId: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Creates a new civilian character.
     */
    createCharacter(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates an existing civilian character.
     */
    updateCharacter(data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Removes a civilian character by identifier.
     */
    removeCharacter(id: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves identifiers assigned to an API ID.
     */
    getIdentifiers(apiId: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Modifies identifiers for an account.
     */
    modifyIdentifier(data: CADModifyIdentifierStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Sets the active identifier by identifier ID.
     */
    setIdentifier(apiId: string | undefined, identId: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Assigns identifiers to a group name.
     */
    setIdentifiersToGroup(entries: CADIdentsToGroupStruct | CADIdentsToGroupStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Toggles panic state for a unit.
     */
    setUnitPanic(apiId: string | undefined, isPanic: boolean, identIds?: number[]): Promise<globalTypes.CADStandardResponse>;
    setUnitPanic(params: CADUnitPanicStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates a unit's status.
     */
    setUnitStatus(apiId: string | undefined, status: number, serverId: number, identIds?: number[]): Promise<globalTypes.CADStandardResponse>;
    setUnitStatus(params: {
        apiId?: string;
        account?: string;
        status: number;
        serverId: number;
        identIds?: number[];
    }): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves live map blips for a CAD server.
     */
    getBlips(serverId: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Adds blips to the CAD map.
     */
    addBlips(blips: CADAddBlipStruct | CADAddBlipStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates existing CAD map blips.
     */
    updateBlips(blips: CADModifyBlipStruct | CADModifyBlipStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Removes a CAD map blip.
     */
    removeBlip(id: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Creates a new 911 call entry.
     */
    create911Call(params: {
        serverId: number;
        isEmergency: boolean;
        caller: string;
        location: string;
        description: string;
        metaData?: Record<string, string>;
    }): Promise<globalTypes.CADStandardResponse>;
    /**
     * Removes a 911 call by its identifier.
     */
    remove911Call(serverId: number, callId: number): Promise<globalTypes.CADStandardResponse>;
    remove911Call(params: CADRemove911Struct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves dispatch calls with optional pagination.
     */
    getCalls(options: CADGetCallsStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves the current call associated with the given account UUID.
     */
    getMyCall(options: CADGetMyCallStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Retrieves active units for the provided filters.
     */
    getActiveUnits(options: CADGetActiveUnitsStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Kicks an active unit from the CAD.
     */
    kickUnit(apiId: string | undefined, reason: string, serverId: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Creates a new dispatch call.
     */
    createDispatch(data: CADNewDispatchStruct): Promise<globalTypes.CADStandardResponse<globalTypes.CADDispatchCallStruct>>;
    /**
     * Edits an existing dispatch call.
     */
    editDispatch(data: CADEditDispatchStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Attaches units to an existing dispatch call.
     */
    attachUnits(serverId: number, callId: number, unitsOrAccount: string[] | string, identIds?: number[]): Promise<globalTypes.CADStandardResponse>;
    attachUnits(params: CADAttachUnitsStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Detaches units from dispatch calls.
     */
    detachUnits(serverId: number, unitsOrAccount: string[] | string): Promise<globalTypes.CADStandardResponse>;
    detachUnits(params: CADDetachUnitsStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates the postal code on a call.
     */
    setCallPostal(serverId: number, callId: number, postal: string): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates a call's primary unit.
     */
    setCallPrimary(serverId: number, callId: number, primary: number, trackPrimary: boolean): Promise<globalTypes.CADStandardResponse>;
    /**
     * Adds a note to an active call.
     */
    addCallNote(serverId: number, callId: number, note: string, label?: string): Promise<globalTypes.CADStandardResponse>;
    addCallNote(serverId: number, callId: number, note: string, noteType: 'text' | 'link', label?: string): Promise<globalTypes.CADStandardResponse>;
    addCallNote(params: CADAddCallNoteStruct): Promise<globalTypes.CADStandardResponse>;
    /**
     * Closes a CAD call.
     */
    closeCall(serverId: number, callId: number): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates live unit locations on the CAD map.
     */
    updateUnitLocations(locations: CADUnitLocationStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Replaces the street sign configuration for a server.
     */
    setStreetSignConfig(serverId: number, signConfig: CADStreetSignStruct[]): Promise<globalTypes.CADStandardResponse>;
    /**
     * Updates an existing street sign's text.
     */
    updateStreetSign(serverId: number, signData: {
        ids: number[];
        text1: string;
        text2: string;
        text3: string;
    }): Promise<globalTypes.CADStandardResponse>;
    private executeCadV2Request;
    private headersInitToRecord;
    private appendCadV2QueryValue;
    private parseCadV2Response;
    private resolveCadV2RetryDelayMs;
    private waitForCadV2Retry;
    private resolveCadServerId;
    private assertPositiveInteger;
    getLoginPageV2(params?: {
        url?: string;
        communityId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    checkApiIdV2(apiId: string): Promise<globalTypes.CADStandardResponse>;
    applyPermissionKeyV2(data: {
        apiId: string;
        permissionKey: string;
    }): Promise<globalTypes.CADStandardResponse>;
    banUserV2(data: {
        accountUuid?: string;
        apiId?: string;
        isBan?: boolean;
        isKick?: boolean;
    }): Promise<globalTypes.CADStandardResponse>;
    setPenalCodesV2(codes: CADPenalCodeStruct[]): Promise<globalTypes.CADStandardResponse>;
    setApiIdsV2(data: {
        username?: string;
        accountUuid?: string;
        apiIds: string[];
        sessionId?: string;
        pushNew?: boolean;
    }): Promise<globalTypes.CADStandardResponse>;
    getTemplatesV2(recordTypeId?: number): Promise<globalTypes.CADStandardResponse>;
    createRecordV2(data: {
        accountUuid?: string;
        apiId?: string;
        record?: unknown;
        useDictionary?: boolean;
        recordTypeId?: number;
        replaceValues?: Record<string, string>;
        deleteAfterMinutes?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    updateRecordV2(recordId: number, data: {
        accountUuid?: string;
        apiId?: string;
        record?: unknown;
        useDictionary?: boolean;
        templateId?: number;
        replaceValues?: Record<string, string>;
    }): Promise<globalTypes.CADStandardResponse>;
    removeRecordV2(recordId: number): Promise<globalTypes.CADStandardResponse>;
    sendRecordDraftV2(data: {
        recordTypeId: number;
        replaceValues: Record<string, string>;
        accountUuid?: string;
        apiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    lookupV2(data: {
        first?: string;
        last?: string;
        mi?: string;
        plate?: string;
        types: number[];
        partial?: boolean;
        agency?: string;
        department?: string;
        subdivision?: string;
        limit?: number;
        offset?: number;
        notifyAccountUuid?: string;
        notifyCommunityUserId?: string;
        notifyApiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    lookupByValueV2(data: {
        searchType: string;
        value: string;
        types: number[];
        limit?: number;
        offset?: number;
        notifyAccountUuid?: string;
        notifyApiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    lookupCustomV2(data: {
        map: string;
        value: string;
        types: number[];
        partial?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    getAccountV2(query?: {
        accountUuid?: string;
        apiId?: string;
        username?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    getAccountsV2(query?: {
        limit?: number;
        offset?: number;
        status?: string | number;
        username?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    createCommunityLinkV2(data: {
        communityUserId: string;
    }): Promise<globalTypes.CADStandardResponse>;
    checkCommunityLinkV2(data: {
        communityUserId: string;
    }): Promise<globalTypes.CADStandardResponse>;
    setAccountPermissionsV2(data: {
        accountUuid?: string;
        apiId?: string;
        username?: string;
        active?: boolean;
        add?: string[];
        remove?: string[];
        set?: string[];
        join?: boolean;
    }): Promise<globalTypes.CADStandardResponse>;
    heartbeatV2(serverId: number | undefined, playerCount: number): Promise<globalTypes.CADStandardResponse>;
    getVersionV2(): Promise<globalTypes.CADStandardResponse>;
    getServersV2(): Promise<globalTypes.CADStandardResponse>;
    setServersV2(servers: unknown[], deployMap?: boolean): Promise<globalTypes.CADStandardResponse>;
    verifySecretV2(secret: string): Promise<globalTypes.CADStandardResponse>;
    authorizeStreetSignsV2(serverId?: number): Promise<globalTypes.CADStandardResponse>;
    setPostalsV2(postals: CADSetPostalStruct[]): Promise<globalTypes.CADStandardResponse>;
    sendPhotoV2(data: {
        apiId: string;
        url: string;
    }): Promise<globalTypes.CADStandardResponse>;
    getInfoV2(): Promise<globalTypes.CADStandardResponse>;
    getCharactersV2(query?: {
        accountUuid?: string;
        apiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    removeCharacterV2(characterId: number): Promise<globalTypes.CADStandardResponse>;
    setSelectedCharacterV2(data: {
        characterId: string;
        accountUuid?: string;
        apiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    getCharacterLinksV2(query?: {
        accountUuid?: string;
        apiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    addCharacterLinkV2(syncId: string, data: {
        accountUuid?: string;
        apiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    removeCharacterLinkV2(syncId: string, data: {
        accountUuid?: string;
        apiId?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    getUnitsV2(query?: {
        serverId?: number;
        includeOffline?: boolean;
        onlyUnits?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    getCallsV2(query?: {
        serverId?: number;
        closedLimit?: number;
        closedOffset?: number;
        type?: string | number;
    }): Promise<globalTypes.CADStandardResponse>;
    getCurrentCallV2(accountUuid: string): Promise<globalTypes.CADStandardResponse>;
    updateUnitLocationsV2(data: {
        serverId?: number;
        updates: Array<{
            apiId: string;
            location: string;
            coordinates?: unknown;
            position?: unknown;
            peerId?: string;
            vehicle?: unknown;
        }>;
    }): Promise<globalTypes.CADStandardResponse>;
    setUnitPanicV2(data: {
        serverId?: number;
        accountUuid?: string;
        apiId?: string;
        apiIds?: string[];
        identIds?: number[];
        isPanic: boolean;
    }): Promise<globalTypes.CADStandardResponse>;
    setUnitStatusV2(data: {
        serverId?: number;
        accountUuid?: string;
        apiId?: string;
        apiIds?: string[];
        identIds?: number[];
        status: string | number;
    }): Promise<globalTypes.CADStandardResponse>;
    kickUnitV2(data: {
        serverId?: number;
        apiId: string;
        reason: string;
    }): Promise<globalTypes.CADStandardResponse>;
    getIdentifiersV2(accountUuid: string): Promise<globalTypes.CADStandardResponse>;
    getAccountUnitsV2(data: {
        serverId?: number;
        accountUuid: string;
        onlyOnline?: boolean;
        onlyUnits?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    selectIdentifierV2(accountUuid: string, identId: number): Promise<globalTypes.CADStandardResponse>;
    createIdentifierV2(accountUuid: string, data: {
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
    }): Promise<globalTypes.CADStandardResponse>;
    updateIdentifierV2(accountUuid: string, identId: number, data: {
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
    }): Promise<globalTypes.CADStandardResponse>;
    deleteIdentifierV2(accountUuid: string, identId: number): Promise<globalTypes.CADStandardResponse>;
    addIdentifiersToGroupV2(data: {
        serverId?: number;
        groupName: string;
        accountUuid?: string;
        apiId?: string;
        apiIds?: string[];
        identIds?: number[];
    }): Promise<globalTypes.CADStandardResponse>;
    createEmergencyCallV2(data: {
        serverId?: number;
        isEmergency: boolean;
        caller: string;
        location: string;
        description: string;
        deleteAfterMinutes?: number;
        metaData?: Record<string, string>;
    }): Promise<globalTypes.CADStandardResponse>;
    deleteEmergencyCallV2(callId: number, serverId?: number): Promise<globalTypes.CADStandardResponse>;
    createDispatchCallV2(data: {
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
    }): Promise<globalTypes.CADStandardResponse>;
    updateDispatchCallV2(callId: number, data: {
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
    }): Promise<globalTypes.CADStandardResponse>;
    attachUnitsToDispatchCallV2(callId: number, data: {
        serverId?: number;
        groupName?: string;
        accountUuid?: string;
        apiId?: string;
        apiIds?: string[];
        identIds?: number[];
    }): Promise<globalTypes.CADStandardResponse>;
    detachUnitsFromDispatchCallV2(data: {
        serverId?: number;
        groupName?: string;
        accountUuid?: string;
        apiId?: string;
        apiIds?: string[];
        identIds?: number[];
    }): Promise<globalTypes.CADStandardResponse>;
    setDispatchPostalV2(callId: number, postal: string, serverId?: number): Promise<globalTypes.CADStandardResponse>;
    setDispatchPrimaryV2(callId: number, identId: number, trackPrimary?: boolean, serverId?: number): Promise<globalTypes.CADStandardResponse>;
    addDispatchNoteV2(callId: number, data: {
        serverId?: number;
        note: string;
        noteType?: string;
        label?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    closeDispatchCallsV2(callIds: number[], serverId?: number): Promise<globalTypes.CADStandardResponse>;
    updateStreetSignsV2(data: {
        serverId?: number;
        ids: number[];
        text1?: string;
        text2?: string;
        text3?: string;
    }): Promise<globalTypes.CADStandardResponse>;
    setStreetSignConfigV2(signs: unknown[], serverId?: number): Promise<globalTypes.CADStandardResponse>;
    setAvailableCalloutsV2(callouts: unknown[], serverId?: number): Promise<globalTypes.CADStandardResponse>;
    getPagerConfigV2(serverId?: number): Promise<globalTypes.CADStandardResponse>;
    setPagerConfigV2(data: {
        natureWords: unknown;
        maxAddresses: number;
        maxBodyLength: number;
        nodes?: unknown;
        serverId?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    setStationsV2(config: unknown, serverId?: number): Promise<globalTypes.CADStandardResponse>;
    getBlipsV2(serverId?: number): Promise<globalTypes.CADStandardResponse>;
    createBlipV2(data: {
        serverId?: number;
        coordinates: unknown;
        subType: string;
        icon: string;
        color: string;
        tooltip: string;
        data?: unknown[];
        radius?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    updateBlipV2(blipId: number, data: {
        serverId?: number;
        coordinates?: unknown;
        subType?: string;
        icon?: string;
        color?: string;
        tooltip?: string;
        data?: unknown[];
        radius?: number;
    }): Promise<globalTypes.CADStandardResponse>;
    deleteBlipsV2(ids: number[], serverId?: number): Promise<globalTypes.CADStandardResponse>;
    private normalizeAccountEntries;
}
