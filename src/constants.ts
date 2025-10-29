import { Collection } from '@discordjs/collection';
import { CADDispatchOriginEnums, CADDispatchStatusEnums } from './libs/rest/src';
import { DataManager } from './managers/DataManager';
import { CADActiveUnitsManager } from './managers/CADActiveUnitsManager';
import { CADActiveUnit } from './structures/CADActiveUnit';

export enum productEnums {
  CAD,
  CMS,
  RADIO
}

export interface CADNewDispatchBuilderOptions {
	serverId?: number;
	origin?: CADDispatchOriginEnums;
	status?: CADDispatchStatusEnums;
	priority?: 1 | 2 | 3;
	block?: string;
	address?: string;
	postal?: string;
	title?: string;
	code?: string;
	primary?: number;
	trackPrimary?: boolean;
	description?: string;
	metaData?: Record<string, string>;
	units?: string[];
}

export type Constructable<T> = abstract new (...args: any[]) => T;

export interface Caches {
	CADActiveUnitsManager: [manager: typeof CADActiveUnitsManager, holds: CADActiveUnit];
}

export type CacheConstructors = {
  [K in keyof Caches]: Caches[K][0] & { name: K };
};

export type CacheFactory = (
  manager: CacheConstructors[keyof Caches],
  holds: Caches[typeof manager['name']][1],
) => typeof manager['prototype'] extends DataManager<infer K, infer V, any> ? Collection<K, V> : never;

export interface CADActiveUnitFetchOptions {
	id?: number | number[];
	accId?: string | string[];
	apiId?: string | string[];
}

export enum CADSubscriptionVersionEnum {
	FREE = 0,
	STARTER = 1,
	STANDARD = 2,
	PLUS = 3,
	PRO = 4,
	ONE = 6
}

export enum CMSSubscriptionVersionEnum {
	FREE = 0,
	STARTER = 1,
	STANDARD = 2,
	PLUS = 3,
	PRO = 4,
	ONE = 6
}

export type Mutable<T> = {
	-readonly [k in keyof T]: T[k];
};

export interface CMSVerifyWhitelistPromiseResult {
	success: boolean;
	reason?: string;
	backendError?: boolean;
}

export interface CMSGetFullWhitelistPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		name: string;
		apiIds: string[];
	}[];
}

export interface CMSGetAccountRanksPromiseResult {
	success: boolean;
	reason?: string;
	data?: string[];
}

export interface CMSGetComAccountPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		accId: string;
		sysStatus: boolean;
		comStatus: boolean;
		joinDate: string;
		lastLogin: string;
		owner: boolean;
		banned: boolean;
		activeApiIds: string[];
		primaryIdentifier: string;
		secondaryIdentifiers: {
			identifiers: { id: string; label: string; }[];
		}
		primaryRank: string;
		secondaryRanks: string[];
		primaryDepartment: string;
		secondaryDepartments: string[];
	}
}

export const uuidRegex = /[a-f0-9]{8}-?[a-f0-9]{4}-?4[a-f0-9]{3}-?[89ab][a-f0-9]{3}-?[a-f0-9]{12}/i;

export interface CMSClockInOutPromiseResult {
	success: boolean;
	reason?: string;
	clockedIn?: boolean;
}

export interface CMSClockInOutParams {
	accId?: string;
	apiId?: string;
	forceClockIn?: boolean;
}

export interface CMSCheckComApiIdPromiseResult {
	success: boolean;
	reason?: string;
	username?: string;
}

export interface CMSGetDepartmentsPromiseResult {
	success: boolean;
	reason?: string;
	data?: CMSDepartment[];
}

export interface CMSSetAccountRanksPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		accId: string;
		sysStatus: boolean;
		comStatus: boolean;
		joinDate: string;
		lastLogin: string;
		owner: boolean;
		banned: boolean;
		activeApiIds: string[];
		primaryIdentifier: string;
		secondaryIdentifiers: {
			identifiers: { id: string; label: string; }[];
		}
		primaryRank: string;
		secondaryRanks: string[];
		primaryDepartment: string;
		secondaryDepartments: string[];
	}
}

export interface CMSSetAccountRanksChangesObject {
	set?: string[];
	add?: string[];
	remove?: string[];
}

export interface CMSDepartment {
	uuid: string;
	label: string;
	labelTwo: string;
	ranks: {
		id: string;
		label: string;
		primaryOnly: boolean;
		secondaryOnly: boolean;
	}[];
}

export interface CADGetAccountPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		uuid: string;
		username: string;
		status: number;
		joined: string;
		lastLogin: string;
		permissions: {
			civilian: boolean;
			lawyer: boolean;
			dmv: boolean;
			police: boolean;
			fire: boolean;
			ems: boolean;
			dispatch: boolean;
			admin: boolean;
			polRecAdd: boolean;
			polRecEdit: boolean;
			polRecRemove: boolean;
			polSuper: boolean;
			polEditUnit: boolean;
			polEditOtherUnit: boolean;
			selfDispatch: boolean;
			liveMap: boolean;
			medRecAdd: boolean;
			medRecEdit: boolean;
			medRecRemove: boolean;
			medSuper: boolean;
			fireRecAdd: boolean;
			fireRecEdit: boolean;
			fireRecRemove: boolean;
			fireSuper: boolean;
			dmvRecAdd: boolean;
			dmvRecEdit: boolean;
			dmvRecRemove: boolean;
			dmvSuper: boolean;
			modifyStreetSigns: boolean;
			lawRecAdd: boolean;
			lawRecEdit: boolean;
			lawRecRemove: boolean;
			lawSuper: boolean;
			adminAccounts: boolean;
			adminPermissionKeys: boolean;
			adminCustomization: boolean;
			adminDepartments: boolean;
			adminTenCodes: boolean;
			adminPenalCodes: boolean;
			adminInGameIntegration: boolean;
			adminDiscordIntegration: boolean;
			adminLimits: boolean;
			adminLogs: boolean;
		},
		apiIds: string[];
	}
}

export interface clockInOutRequest {
	id: number;
	notes: any[];
	endTime: string;
	completed: boolean;
	startTime: string;
}

export interface CMSSetAccountNamePromiseResult {
	success: boolean;
	data?: string;
	reason?: string;
}

export interface CADSetClockTimePromiseResult {
	success: boolean;
	reason?: string;
	data?: unknown;
}

export interface CADJoinCommunityPromiseResult {
	success: boolean;
	reason?: string;
	data?: unknown;
}

export interface CADLeaveCommunityPromiseResult {
	success: boolean;
	reason?: string;
	data?: unknown;
}

export interface CMSProfileField {
	id: string;
	type: string;
	label: string;
	options: unknown;
}

export interface CMSKickAccountPromiseResult {
	success: boolean;
	reason?: string;
}

export interface CMSBanAccountPromiseResult {
	success: boolean;
	reason?: string;
}

export interface CMSForceSyncPromiseResult {
	success: boolean;
	reason?: string;
}

export interface CMSGetCurrentClockInPromiseResult {
	success: boolean;
	reason?: string;
	data?: clockInOutRequest | null;
}

export interface CMSAccountSummary {
	accId: string;
	accName: string;
	activeApiIds: string[];
	discordId?: string;
	sysStatus: boolean;
	comStatus: boolean;
	archived: boolean;
	banned: boolean;
	[key: string]: unknown;
}

export interface CMSAccountsPage {
	total: number;
	skip: number;
	take: number;
	accounts: CMSAccountSummary[];
}

export interface CMSGetAccountsPromiseResult {
	success: boolean;
	reason?: string;
	data?: CMSAccountsPage;
}

export interface CMSGetProfileFieldsPromiseResult {
	success: boolean;
	reason?: string;
	data?: CMSProfileField[];
}

export interface CMSProfileFieldUpdate {
	id: string;
	value: unknown;
}

export interface CMSEditAccountProfileFieldsPromiseResult {
	success: boolean;
	reason?: string;
	data?: CMSProfileFieldUpdate[];
}

export interface CMSRsvpPromiseResult {
	success: boolean;
	reason?: string;
	status?: string;
	data?: unknown;
}

export interface CMSSetGameServerStruct {
	id?: number;
	name: string;
	description?: string;
	ip?: string;
	port?: string;
	allowedRanks?: string[];
	blockedRanks?: string[];
	[key: string]: unknown;
}

export interface CMSSetGameServersPromiseResult {
	success: boolean;
	reason?: string;
	data?: CMSSetGameServerStruct[];
}

export interface CMSGetFormSubmissionsPromiseResult<T = unknown> {
	success: boolean;
	reason?: string;
	data?: T[];
}

export interface CMSERLCGetOnlinePlayersPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		Player: string;
		Permission: string;
		Callsingn?: string;
		Team?: string;
	}[];
}

export interface CMSERLCGetPlayerQueuePromiseResult {
	success: boolean;
	reason?: string;
	data?: number;
}

export interface CMSERLCAddNewRecordPromiseResult {
	success: boolean;
	reason?: string;
	logId?: string;
}

export interface RadioChannelGroup {
	id: number;
	name: string;
	orderIndex: number;
}

export interface RadioChannel {
	id: number;
	groupId: number;
	displayName: string;
	recvFreqMajor: number;
	recvFreqMinor: number;
	xmitFreqMajor: number;
	xmitFreqMinor: number;
	repeatsXmit: boolean;
	status: boolean;
	orderIndex: number;
	talkoverProtection: boolean;
	[key: string]: unknown;
}

export interface RadioConnectedUserMetadataScanList {
	id: number;
	name: string;
	channelIds: number[];
	[key: string]: unknown;
}

export interface RadioConnectedUserMetadataState {
	primaryChId?: number;
	scannedChIds?: number[];
	scanLists?: RadioConnectedUserMetadataScanList[];
	spec?: number;
	[key: string]: unknown;
}

export interface RadioConnectedUserMetadata {
	sonrad?: boolean;
	state?: RadioConnectedUserMetadataState;
	[key: string]: unknown;
}

export interface RadioConnectedUser {
	identity: string;
	name: string;
	roomId?: number;
	metadata: RadioConnectedUserMetadata;
	[key: string]: unknown;
}

export interface RadioSpeakerLocation {
	label: string;
	id: string;
}

export interface RadioSetUserChannelsOptions {
	transmit?: number;
	scan?: number[];
}

export type RadioSubscriptionLevel = 0 | 1 | 2;

export interface RadioGetCommunityChannelsPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		result: string;
		groups: RadioChannelGroup[];
		channels: RadioChannel[];
		[key: string]: unknown;
	};
}

export interface RadioGetConnectedUsersPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		result: string;
		connectedUsers: RadioConnectedUser[];
		[key: string]: unknown;
	};
}

export interface RadioGetConnectedUserPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		result: string;
		data: RadioConnectedUser;
		[key: string]: unknown;
	};
}

export interface RadioSetUserChannelsPromiseResult {
	success: boolean;
	reason?: string;
	result?: string;
}

export interface RadioSetUserDisplayNamePromiseResult {
	success: boolean;
	reason?: string;
	result?: string;
}

export interface RadioGetServerSubscriptionFromIpPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		result: string;
		subscription: RadioSubscriptionLevel;
		[key: string]: unknown;
	};
}

export interface RadioSetServerIpPromiseResult {
	success: boolean;
	reason?: string;
	result?: string;
}

export interface RadioSetInGameSpeakerLocationsPromiseResult {
	success: boolean;
	reason?: string;
	result?: string;
}
