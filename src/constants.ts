import Collection from '@discordjs/collection';
import { CADDispatchOriginEnums, CADDispatchStatusEnums } from './libs/rest/src';
import { DataManager } from './managers/DataManager';
import { CADActiveUnitsManager } from './managers/CADActiveUnitsManager';
import { CADActiveUnit } from './structures/CADActiveUnit';

export enum productEnums {
  CAD,
  CMS
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
}

export interface CMSGetComAccountPromiseResult {
	success: boolean;
	reason?: string;
	data?: {
		accId: string;
		active: boolean;
		accName: string;
		comName: string;
		primaryIdentifier: string;
		secondaryIdentifiers: string[];
		primaryRank: string;
		secondaryRanks: string[];
		primaryDepartment: string;
		secondaryDepartments: string[];
		joinDate: string;
		totalRankPower: number;
		comOwner: boolean;
		isBanned: boolean;
		lastLogin: string;
		activeApiIds: string[];
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