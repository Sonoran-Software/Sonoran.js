import { productEnums, RadioSetUserChannelsOptions, RadioSpeakerLocation, CMSProfileFieldUpdate, CMSSetGameServerStruct } from '../../../../../constants';
import type { RESTOptions } from '../REST';

export const DefaultUserAgent = 'Sonoran.js NPM Module';

export const DefaultCADRestOptions: Required<RESTOptions> = {
	agent: {},
	api: 'https://api.sonorancad.com',
	headers: {},
	rejectOnRateLimit: true
};

export const DefaultCMSRestOptions: Required<RESTOptions> = {
	agent: {},
	api: 'https://api.sonorancms.com',
	headers: {},
	rejectOnRateLimit: true
};

export const DefaultRadioRestOptions: Required<RESTOptions> = {
	agent: {},
	api: 'https://api.sonoranradio.com',
	headers: {},
	rejectOnRateLimit: true
};

/**
 * The events that the REST manager emits
 */
export const enum RESTEvents {
	Debug = 'restDebug',
	InvalidRequestWarning = 'invalidRequestWarning',
	RateLimited = 'rateLimited',
	Request = 'request',
	Response = 'response'
}

export interface APITypeData {
	type: string;
	path: string;
	method: 'POST' | 'GET' | 'DELETE' | 'PATCH';
	minVersion: number;
}

export interface AllAPITypeData {
	product: productEnums;
	type: string;
	path: string;
	method: 'POST' | 'GET' | 'DELETE' | 'PATCH';
	minVersion: number;
}

export const GeneralCADAPITypes: APITypeData[] = [
	{
		type: 'GET_SERVERS',
		path: 'general/get_servers',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'SET_SERVERS',
		path: 'general/set_servers',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'GET_VERSION',
		path: 'general/get_version',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'SET_PENAL_CODES',
		path: 'general/set_penal_codes',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'SET_API_ID',
		path: 'general/set_api_id',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'GET_TEMPLATES',
		path: 'general/get_templates',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'NEW_RECORD',
		path: 'general/new_record',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'EDIT_RECORD',
		path: 'general/edit_record',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'REMOVE_RECORD',
		path: 'general/remove_record',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'LOOKUP_INT',
		path: 'general/lookup_int',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'LOOKUP',
		path: 'general/lookup',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'GET_ACCOUNT',
		path: 'general/get_account',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'CHECK_APIID',
		path: 'general/check_apiid',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'APPLY_PERMISSION_KEY',
		path: 'general/apply_permission_key',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'SET_ACCOUNT_PERMISSIONS',
		path: 'general/set_account_permissions',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'BAN_USER',
		path: 'general/ban_user',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'VERIFY_SECRET',
		path: 'general/verify_secret',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'AUTH_STREETSIGNS',
		path: 'general/auth_streetsigns',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'SET_POSTALS',
		path: 'general/set_postals',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'SEND_PHOTO',
		path: 'general/send_photo',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'SET_CLOCK',
		path: 'general/set_clock',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'JOIN_COMMUNITY',
		path: 'sso/community',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'LEAVE_COMMUNITY',
		path: 'sso/community',
		method: 'POST',
		minVersion: 0
	}
];

export const CivilianCADAPITypes: APITypeData[] = [
	{
		type: 'GET_CHARACTERS',
		path: 'civilian/get_characters',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'NEW_CHARACTER',
		path: 'civilian/new_character',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'EDIT_CHARACTER',
		path: 'civilian/edit_characters',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'REMOVE_CHARACTER',
		path: 'civilian/remove_character',
		method: 'POST',
		minVersion: 2
	}
];

export const EmergencyCADAPITypes: APITypeData[] = [
	{
		type: 'GET_IDENTIFIERS',
		path: 'emergency/get_identifiers',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'MODIFY_IDENTIFIER',
		path: 'emergency/modify_identifier',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'SET_IDENTIFIER',
		path: 'emergency/set_identifier',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'UNIT_PANIC',
		path: 'emergency/unit_panic',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'UNIT_STATUS',
		path: 'emergency/unit_status',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'GET_BLIPS',
		path: 'emergency/get_blips',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'ADD_BLIP',
		path: 'emergency/add_blip',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'MODIFY_BLIP',
		path: 'emergency/modify_blip',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'REMOVE_BLIP',
		path: 'emergency/remove_blip',
		method: 'POST',
		minVersion: 4
	},
	{
		type: '911_CALL',
		path: 'emergency/911_call',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'REMOVE_911',
		path: 'emergency/remove_911',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'GET_CALLS',
		path: 'emergency/get_calls',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'GET_ACTIVE_UNITS',
		path: 'emergency/get_active_units',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'KICK_UNIT',
		path: 'emergency/kick_unit',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'NEW_DISPATCH',
		path: 'emergency/new_dispatch',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'ATTACH_UNIT',
		path: 'emergency/attach_unit',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'DETACH_UNIT',
		path: 'emergency/detach_unit',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'SET_CALL_POSTAL',
		path: 'emergency/set_call_postal',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'SET_CALL_PRIMARY',
		path: 'emergency/set_call_primary',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'ADD_CALL_NOTE',
		path: 'emergency/add_call_note',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'CLOSE_CALL',
		path: 'emergency/close_call',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'UNIT_LOCATION',
		path: 'emergency/unit_location',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'SET_STREETSIGN_CONFIG',
		path: 'emergency/set_streetsign_config',
		method: 'POST',
		minVersion: 4
	},
	{
		type: 'UPDATE_STREETSIGN',
		path: 'emergency/update_streetsign',
		method: 'POST',
		minVersion: 4
	}
];

export const GeneralCMSAPITypes: APITypeData[] = [
	{
		type: 'GET_COM_ACCOUNT',
		path: 'general/get_com_account',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 3
	},
	{
		type: 'GET_CURRENT_CLOCK_IN',
		path: 'general/get_current_clock_in',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 0
	},
	{
		type: 'GET_ACCOUNTS',
		path: 'general/get_accounts',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 0
	},
	{
		type: 'GET_ACCOUNT_RANKS',
		path: 'general/get_account_ranks',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 2,
	},
	{
		type: 'SET_ACCOUNT_RANKS',
		path: 'general/set_account_ranks',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 2,
	},
	{
		type: 'GET_DEPARTMENTS',
		path: 'general/get_departments',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 2,
	},
	{
		type: 'GET_PROFILE_FIELDS',
		path: 'general/get_profile_fields',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 0
	},
	{
		type: 'GET_SUB_VERSION',
		path: 'general/get_sub_version',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 0
	},
	{
		type: 'CHECK_COM_APIID',
		path: 'general/check_com_apiid',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'CLOCK_IN_OUT',
		path: 'general/clock_in_out',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'KICK_ACCOUNT',
		path: 'general/kick_account',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'BAN_ACCOUNT',
		path: 'general/ban_account',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'EDIT_ACC_PROFLIE_FIELDS',
		path: 'general/edit_acc_profile_fields',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'SET_ACCOUNT_NAME',
		path: 'general/set_account_name',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'FORCE_SYNC',
		path: 'general/force_sync',
		method: 'POST',
		minVersion: 0
	}
];

export const ServersCMSAPITypes: APITypeData[] = [
	{
		type: 'GET_GAME_SERVERS',
		path: 'servers/get_game_servers',
		method: 'POST', // Would've been 'GET' but fetch doesn't allow body with GET requests.
		minVersion: 2
	},
	{
		type: 'SET_GAME_SERVERS',
		path: 'servers/set_game_servers',
		method: 'POST',
		minVersion: 2
	},
	{
		type: 'VERIFY_WHITELIST',
		path: 'servers/verify_whitelist',
		method: 'POST',
		minVersion: 3
	},
	{
		type: 'FULL_WHITELIST',
		path: 'servers/full_whitelist',
		method: 'POST',
		minVersion: 3
	}
];

export const EventsCMSAPITypes: APITypeData[] = [
	{
		type: 'RSVP',
		path: 'events/rsvp',
		method: 'POST',
		minVersion: 3
	}
];

export const FormsCMSAPITypes: APITypeData[] = [
	{
		type: 'CHANGE_FORM_STAGE',
		path: 'forms/change/stage',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'GET_FORM_TEMPLATE_SUBMISSIONS',
		path: 'forms/get_template_submissions',
		method: 'POST',
		minVersion: 0
	}
];

export const CommunitiesCMSAPITypes: APITypeData[] = [
	{
		type: 'LOOKUP',
		path: 'communities/lookup',
		method: 'POST',
		minVersion: 0
	},
];

export const ERLCMSAPITypes: APITypeData[] = [
	{
		type: "ERLC_GET_ONLINE_PLAYERS",
		path: "erlc/get_online_players",
		method: "POST",
		minVersion: 0
	},
	{
		type: "ERLC_GET_PLAYER_QUEUE",
		path: "erlc/get_player_queue",
		method: "POST",
		minVersion: 0
	},
	{
		type: "ERLC_ADD_NEW_RECORD",
		path: "erlc/add_new_record",
		method: "POST",
		minVersion: 0
	}
];

export const RadioAPITypes: APITypeData[] = [
	{
		type: 'RADIO_GET_COMMUNITY_CHANNELS',
		path: 'api/radio/get-community-channels',
		method: 'GET',
		minVersion: 0
	},
	{
		type: 'RADIO_GET_CONNECTED_USERS',
		path: 'api/radio/get-connected-users',
		method: 'GET',
		minVersion: 0
	},
	{
		type: 'RADIO_GET_CONNECTED_USER',
		path: 'api/radio/get-connected-user',
		method: 'GET',
		minVersion: 0
	},
	{
		type: 'RADIO_SET_USER_CHANNELS',
		path: 'api/radio/set-user-channels',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'RADIO_SET_USER_DISPLAY_NAME',
		path: 'api/set-user-display-name',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'RADIO_GET_SERVER_SUBSCRIPTION_FROM_IP',
		path: 'radio/check-server-subscription',
		method: 'GET',
		minVersion: 0
	},
	{
		type: 'RADIO_SET_SERVER_IP',
		path: 'radio/set-server-ip',
		method: 'POST',
		minVersion: 0
	},
	{
		type: 'RADIO_SET_IN_GAME_SPEAKER_LOCATIONS',
		path: 'radio/set-server-speakers',
		method: 'POST',
		minVersion: 0
	}
];

function formatForAll(array: APITypeData[], product: productEnums): AllAPITypeData[] {
	return array.map((val) => {
		return {
			...val,
			product
		}
	});
}

export const AllAPITypes: AllAPITypeData[] = [ ...formatForAll(GeneralCADAPITypes, productEnums.CAD), ...formatForAll(CivilianCADAPITypes, productEnums.CAD), ...formatForAll(EmergencyCADAPITypes, productEnums.CAD), ...formatForAll(GeneralCMSAPITypes, productEnums.CMS), ...formatForAll(ServersCMSAPITypes, productEnums.CMS), ...formatForAll(EventsCMSAPITypes, productEnums.CMS),  ...formatForAll(FormsCMSAPITypes, productEnums.CMS), ...formatForAll(CommunitiesCMSAPITypes, productEnums.CMS), ...formatForAll(ERLCMSAPITypes, productEnums.CMS), ...formatForAll(RadioAPITypes, productEnums.RADIO) ];

export type AllAPITypesType = 'GET_SERVERS' | 'SET_SERVERS' | 'GET_VERSION' | 'SET_PENAL_CODES' | 'SET_API_ID' | 'GET_TEMPLATES' | 'NEW_RECORD' | 'EDIT_RECORD' | 'REMOVE_RECORD' | 'LOOKUP_INT' | 'LOOKUP' | 'GET_ACCOUNT' | 'CHECK_APIID' | 'APPLY_PERMISSION_KEY' | 'SET_ACCOUNT_PERMISSIONS' | 'BAN_USER' | 'VERIFY_SECRET' | 'AUTH_STREETSIGNS' | 'SET_POSTALS' | 'SEND_PHOTO' | 'SET_CLOCK' | 'JOIN_COMMUNITY' | 'LEAVE_COMMUNITY' | 'GET_CHARACTERS' | 'NEW_CHARACTER' | 'EDIT_CHARACTER' | 'REMOVE_CHARACTER' | 'GET_IDENTIFIERS' | 'MODIFY_IDENTIFIER' | 'SET_IDENTIFIER' | 'UNIT_PANIC' | 'UNIT_STATUS' | 'GET_BLIPS' | 'ADD_BLIP' | 'MODIFY_BLIP' | 'REMOVE_BLIP' | '911_CALL' | 'REMOVE_911' | 'GET_CALLS' | 'GET_ACTIVE_UNITS' | 'KICK_UNIT' | 'NEW_DISPATCH' | 'ATTACH_UNIT' | 'DETACH_UNIT' | 'SET_CALL_POSTAL' | 'SET_CALL_PRIMARY' | 'ADD_CALL_NOTE' | 'CLOSE_CALL' | 'UNIT_LOCATION' | 'SET_STREETSIGN_CONFIG' | 'UPDATE_STREETSIGN' | 'GET_COM_ACCOUNT' | 'GET_DEPARTMENTS' | 'GET_SUB_VERSION' | 'GET_CURRENT_CLOCK_IN' | 'GET_ACCOUNTS' | 'GET_PROFILE_FIELDS' | 'CHECK_COM_APIID' | 'VERIFY_WHITELIST' | 'CLOCK_IN_OUT' | 'FULL_WHITELIST' | 'GET_ACCOUNT_RANKS' | 'SET_ACCOUNT_RANKS' | 'RSVP' | 'CHANGE_FORM_STAGE' | 'GET_FORM_TEMPLATE_SUBMISSIONS' | 'KICK_ACCOUNT' | 'BAN_ACCOUNT' | 'LOOKUP' | 'EDIT_ACC_PROFLIE_FIELDS' | 'SET_ACCOUNT_NAME' | 'FORCE_SYNC' | 'SET_GAME_SERVERS' | 'ERLC_GET_ONLINE_PLAYERS' | 'ERLC_GET_PLAYER_QUEUE' | 'ERLC_ADD_NEW_RECORD' | 'RADIO_GET_COMMUNITY_CHANNELS' | 'RADIO_GET_CONNECTED_USERS' | 'RADIO_GET_CONNECTED_USER' | 'RADIO_SET_USER_CHANNELS' | 'RADIO_SET_USER_DISPLAY_NAME' | 'RADIO_GET_SERVER_SUBSCRIPTION_FROM_IP' | 'RADIO_SET_SERVER_IP' | 'RADIO_SET_IN_GAME_SPEAKER_LOCATIONS';

export interface CMSServerAPIStruct {
	id: number;
	name: string;
	description: string;
}

export interface CADServerAPIStruct {
	id: number;
	name: string;
	description: string;
	signal: string;
	mapUrl: string;
	mapIp: string;
	listenerPort: number;
	differingOutbound: boolean;
	outboundIp: string;
	enableMap: boolean;
	isStatic: boolean;
	mapType: string;
}

export interface CADPenalCodeStruct {
	code: string;
	type: string;
	title: string;
	bondType: string;
	jailTime: string;
	bondAmount: number;
}

export interface CADSetAPIIDStruct {
	username: string;
	sessionId?: string;
	apiIds: string[];
	pushNew: boolean;
}

export enum CADRecordTypeEnums {
	Warrant = 2,
	Bolo = 3,
	License = 4,
	VehicleRegistration = 5,
	Character = 7,
	PoliceRecord = 8,
	PoliceReport = 9,
	MedicalRecord = 10,
	MedicalReport = 11,
	FireRecord = 12,
	FireReport = 13,
	DMVRecord = 14,
	LawRecord = 15,
	LawReport = 16
}

export enum CADRecordSectionCategoryEnums {
	Custom,
	Flags,
	Speed = 5,
	Charges = 6,
	LinkedRecords = 9
}

export interface CADRecordDependencyStruct {
	type: string;
	fid: string;
	acceptableValues: string[];
}

export interface CADRecordSectionFieldStruct {
	type: 'INPUT' | 'TEXTAREA' | 'ADDRESS' | 'SELECT' | 'STATUS' | 'DATE' | 'TIME' | 'IMAGE' | 'CHECKBOXES' | 'LABEL' | 'UNIT_NUMBER' | 'UNIT_NAME' | 'UNIT_RANK' | 'UNIT_AGENCY' | 'UNIT_DEPARTMENT' | 'UNIT_SUBDIVISION' | 'UNIT_AGENCY_LOCATION' | 'UNIT_AGENCY_ZIP' | 'UNIT_LOCATION';
	value: string;
	size: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
	data: Record<string | number | symbol, unknown>;
	options: string[];
	isPreviewed: boolean;
	isSupervisor: boolean;
	isRequired: boolean;
	unique: boolean;
	readOnly: boolean;
	mask: string;
	maskReverse: boolean;
	dbMap: boolean;
	isFromSync: boolean;
	uid: string;
	dependency: CADRecordDependencyStruct;
}

export interface CADRecordSectionStruct {
	category: CADRecordSectionCategoryEnums;
	label: string;
	fields: CADRecordSectionFieldStruct[];
	searchCiv: boolean;
	searchVeh: boolean;
	enableDuplicate: boolean;
	dependency: CADRecordDependencyStruct;
}

export interface CADRecordStruct {
	recordTypeId: number;
	id: number;
	syncId: string;
	name: string;
	type: CADRecordTypeEnums;
	sections: CADRecordSectionStruct[];
}

export interface CADNewEditRecordOptionOneStruct {
	user: string;
	useDictionary: boolean;
	recordTypeId: number;
	replaceValues: Record<string, string>;
}

export interface CADNewEditRecordOptionTwoStruct {
	user: string;
	record: CADRecordStruct;
}

export enum CADLookupByIntSearchTypeEnums {
	IDENTIFIER,
	SUPERVISOR_STATUS,
	ACTIVE_STATUS,
	NUMBER
}

export interface CADLookupByIntStruct {
	apiId?: string;
	searchType: CADLookupByIntSearchTypeEnums;
	value: number;
	types: number[],
	limit?: number;
	offset?: number;
}

export interface CADLookupStruct {
	apiId?: string;
	types: number[];
	first: string;
	last: string;
	mi: string;
	plate: string;
	partial: boolean;
	agency?: string;
	department?: string;
	subdivision?: string;
}

export interface CADModifyAccountPermsStruct {
	apiId?: string;
	username?: string;
	active?: boolean;
	add: string[];
	remove: string[];
}

export interface CADKickBanUserStruct {
	apiId: string;
	isBan?: boolean;
	isKick?: boolean;
}

export interface CADSetPostalStruct {
	code: string;
	x: number;
	y: number;
}

export enum CADModifyIdentifierActionEnums {
	ADD,
	EDIT,
	REMOVE
}

export interface CADModifyIdentifierStruct {
	apiId: string;
	action: CADModifyIdentifierActionEnums;
	identifier?: Record<string, string>;
	identId?: number;
}

export interface CADBlipStruct {
	id: number;
	coordinates: {
		x: number;
		y: number;
	};
	icon: string;
	color: string;
	tooltip: string;
}

export interface CADAddBlipStruct {
	serverId: number;
	blip: CADBlipStruct;
}

export interface CADModifyBlipStruct {
	id: number;
	coordinates?: {
		x: number;
		y: number;
	};
	icon?: string;
	color?: string;
	tooltip?: string;
}

export interface CADGetCallsStruct {
	serverId?: number;
	closedLimit?: number;
	closedOffset?: number;
}

export interface CADGetActiveUnitsStruct {
	serverId?: number;
	onlyUnits?: boolean;
	includeOffline?: boolean;
	limit?: number;
	offset?: number;
}

export enum CADDispatchOriginEnums {
	Caller,
	RadioDispatch,
	Observed,
	WalkUp
}

export enum CADDispatchStatusEnums {
	Pending,
	Active,
	Closed
}

export interface CADNewDispatchStruct {
	serverId: number;
	origin: CADDispatchOriginEnums;
	status: CADDispatchStatusEnums;
	priority: 1 | 2 | 3;
	block: string;
	address: string;
	postal: string;
	title: string;
	code: string;
	primary: number;
	trackPrimary: boolean;
	description: string;
	metaData: Record<string, string>;
	units: string[];
}

export interface CADStreetSignStruct {
	id: number;
	label: string;
	text1: string;
	text2: string;
	text3: string;
}

export interface CADUnitLocationStruct {
	apiId: string;
location: string;
}

export interface RESTTypedAPIDataStructs {
	// CAD - General
	GET_SERVERS: [];
	SET_SERVERS: [
		servers: CADServerAPIStruct[],
		deployMap: boolean
	];
	GET_VERSION: [];
	SET_PENAL_CODES: [data: CADPenalCodeStruct[]];
	SET_API_ID: [data: CADSetAPIIDStruct];
	GET_TEMPLATES: [recordTypeId?: number];
	NEW_RECORD: [data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct];
	EDIT_RECORD: [data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct];
	REMOVE_RECORD: [id: number];
	LOOKUP_INT: [data: CADLookupByIntStruct];
	LOOKUP: [data: CADLookupStruct];
	GET_ACCOUNT: [
		apiId?: string,
		username?: string
	];
	CHECK_APIID: [apiId: string];
	APPLY_PERMISSION_KEY: [
		apiId: string | undefined,
		permissionKey: string
	];
	SET_ACCOUNT_PERMISSIONS: [data: CADModifyAccountPermsStruct];
	BAN_USER: [data: CADKickBanUserStruct];
	VERIFY_SECRET: [secret: string];
	AUTH_STREETSIGNS: [serverId: number];
	SET_POSTALS: [data: CADSetPostalStruct[]];
	SEND_PHOTO: [
		apiId: string | undefined,
		url: string
	];
	SET_CLOCK: [
		data: {
			serverId: number,
			currentUtc: string,
			currentGame: string,
			secondsPerHour: number
		}
	];
	JOIN_COMMUNITY: [
		payload: {
			internalKey: string,
			accounts: Array<{ account: string }>
		}
	];
	LEAVE_COMMUNITY: [
		payload: {
			internalKey: string,
			accounts: Array<{ account: string }>
		}
	];
	// CAD - Civilian
	GET_CHARACTERS: [apiId: string];
	NEW_CHARACTER: [data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct];
	EDIT_CHARACTER: [data: CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct];
	REMOVE_CHARACTER: [id: number];
	// CAD - Emergency
	GET_IDENTIFIERS: [apiId: string];
	MODIFY_IDENTIFIER: [data: CADModifyIdentifierStruct];
	SET_IDENTIFIER: [
		apiId: string | undefined,
		identId: number
	];
	UNIT_PANIC: [
		apiId: string | undefined,
		isPanic: boolean
	];
	UNIT_STATUS: [
		apiId: string | undefined,
		status: number,
		serverId: number
	];
	GET_BLIPS: [serverId: number];
	ADD_BLIP: [data: CADAddBlipStruct[]];
	MODIFY_BLIP: [data: CADModifyBlipStruct[]];
	REMOVE_BLIP: [id: number];
	REMOVE_911: [callId: number];
	GET_CALLS: [data: CADGetCallsStruct];
	GET_ACTIVE_UNITS: [data: CADGetActiveUnitsStruct];
	KICK_UNIT: [
		apiId: string | undefined,
		reason: string,
		serverId: number
	];
	NEW_DISPATCH: [data: CADNewDispatchStruct];
	ATTACH_UNIT: [
		serverId: number,
		callId: number,
		units: string[]
	];
	DETACH_UNIT: [
		serverId: number,
		units: string[]
	];
	SET_CALL_POSTAL: [
		serverId: number,
		callId: number,
		postal: string
	];
	SET_CALL_PRIMARY: [
		serverId: number,
		callId: number,
		primary: number,
		trackPrimary: boolean
	];
	ADD_CALL_NOTE: [
		serverId: number,
		callId: number,
		note: string
	];
	CLOSE_CALL: [
		serverId: number,
		callId: number
	];
	'CALL_911': [
		serverId: number,
		isEmergency: boolean,
		caller: string,
		location: string,
		description: string,
		metaData: Record<string, string>
	];
	SET_STREETSIGN_CONFIG: [
		serverId: number,
		signConfig: CADStreetSignStruct[]
	];
	UPDATE_STREETSIGN: [
		serverId: number,
		signData: {
			ids: number[],
			text1: string,
			text2: string,
			text3: string
		}
	];
	UNIT_LOCATION: [data: CADUnitLocationStruct[]];
	// CMS - General
	GET_COM_ACCOUNT: [
		apiId?: string,
		username?: string,
		accId?: string,
		discord?: string,
		uniqueId?: string
	];
	GET_SUB_VERSION: [];
	GET_CURRENT_CLOCK_IN: [
		apiId?: string,
		username?: string,
		accId?: string,
		discord?: string,
		uniqueId?: string
	];
	GET_ACCOUNTS: [
		options?: {
			skip?: number,
			take?: number,
			sysStatus?: boolean,
			comStatus?: boolean,
			banned?: boolean,
			archived?: boolean
		}
	];
	GET_PROFILE_FIELDS: [];
	CHECK_COM_APIID: [apiId: string];
	CLOCK_IN_OUT: [
		apiId?: string,
		accId?: string,
		forceClockIn?: boolean,
		discord?: string,
		uniqueId?: string
	];
	GET_DEPARTMENTS: [];
	GET_ACCOUNT_RANKS: [
		apiId?: string,
		username?: string,
		accId?: string,
		discord?: string,
		uniqueId?: string,
	],
	SET_ACCOUNT_RANKS: [
		accId?: string,
		set?: string[],
		add?: string[],
		remove?: string[],
		apiId?: string,
		username?: string,
		discord?: string,
		uniqueId?: string,
	],
	SET_ACCOUNT_NAME: [
		apiId: string | undefined,
		username: string | undefined,
		accId: string | undefined,
		discord: string | undefined,
		uniqueId: string | undefined,
		newName: string,
	],
	FORCE_SYNC: [
		apiId: string | undefined,
		username: string | undefined,
		accId: string | undefined,
		discordId: string | undefined,
		uniqueId: string | undefined,
	],
	// CMS - Servers
	GET_GAME_SERVERS: [];
	SET_GAME_SERVERS: [servers: CMSSetGameServerStruct[]];
	VERIFY_WHITELIST: [
		apiId: string | undefined,
		accId: string | undefined,
		serverId: number,
		username: string | undefined,
		discord: string | undefined,
		uniqueId: number | undefined,
	];
	FULL_WHITELIST: [
		serverId?: number,
	]
	RSVP : [
		eventId: string,
		apiId: string | undefined,
		accId: string | undefined,
		discord: string | undefined,
		uniqueId: string | undefined
	],
	EDIT_ACC_PROFLIE_FIELDS : [
		apiId: string | undefined,
		username: string | undefined,
		accId: string | undefined,
		discord: string | undefined,
		uniqueId: string | undefined,
		profileFields : CMSProfileFieldUpdate[]
	]
	// CMS - Forms
	CHANGE_FORM_STAGE: [
		accId: string | undefined,
		formId: number,
		newStageId: string,
		apiId: string | undefined,
		username: string | undefined,
		discord: string | undefined,
		uniqueId: number,
	]
	GET_FORM_TEMPLATE_SUBMISSIONS: [
		templateId: number,
		skip?: number,
		take?: number,
	]
	BAN_ACCOUNT: [
		apiId: string | undefined,
		username: string | undefined,
		accId: string | undefined,
		discord: string | undefined,
		uniqueId: string | undefined,
	]
	KICK_ACCOUNT: [
		apiId: string | undefined,
		username: string | undefined,
		accId: string | undefined,
		discord: string | undefined,
		uniqueId: string | undefined,
	]
	// CMS - ERLC
	ERLC_GET_ONLINE_PLAYERS: [
		robloxJoinCode: string
	]
	ERLC_GET_PLAYER_QUEUE: [
		robloxJoinCode: string
	]
	ERLC_ADD_NEW_RECORD: [
		robloxJoinCode: string,
		executerDiscordId: string | number,
		type: string,
		reason: string,
		playerDiscordId?: string | number,
		playerRobloxId?: string | number,
		points?: number,
	]
	// Radio
	RADIO_GET_COMMUNITY_CHANNELS: [];
	RADIO_GET_CONNECTED_USERS: [];
	RADIO_GET_CONNECTED_USER: [
		roomId: number,
		identity: string
	];
	RADIO_SET_USER_CHANNELS: [
		identity: string,
		options?: RadioSetUserChannelsOptions
	];
	RADIO_SET_USER_DISPLAY_NAME: [
		accId: string | undefined,
		displayName: string
	];
	RADIO_GET_SERVER_SUBSCRIPTION_FROM_IP: [];
	RADIO_SET_SERVER_IP: [
		pushUrl: string
	];
	RADIO_SET_IN_GAME_SPEAKER_LOCATIONS: [
		locations: RadioSpeakerLocation[],
		token?: string
	];
}

export type PossibleRequestData =
	undefined |
	{
		data: CADPenalCodeStruct[] | CADSetAPIIDStruct | CADNewEditRecordOptionOneStruct | CADNewEditRecordOptionTwoStruct | CADLookupByIntStruct | CADLookupStruct | CADModifyAccountPermsStruct | CADKickBanUserStruct | CADSetPostalStruct[] | CADModifyIdentifierStruct | CADAddBlipStruct[] | CADModifyBlipStruct[] | CADGetCallsStruct | CADGetActiveUnitsStruct | CADNewDispatchStruct
	} |
	{
		servers: CADServerAPIStruct[];
		deployMap: boolean;
	} |
	{
		data: {
			serverId: number;
			currentUtc: string;
			currentGame: string;
			secondsPerHour: number;
		}
	} |
	{
		id: number;
	} |
	{
		recordTypeId?: number;
	} |
	{
		apiId?: string;
		username?: string;
	} |
	{
		apiId: string
	} |
	{
		apiId: string;
		permissionKey: string;
	} |
	{
		secret: string;
	} |
	{
		serverId: number;
	} |
	{
		serverId?: number;
	} |
	{
		apiId: string;
		url: string;
	} |
	{
		apiId: string;
		identId: number;
	} |
	{
		apiId: string;
		isPanic: boolean;
	} |
	{
		apiId: string;
		status: number;
		serverId: number;
	} |
	{
		callId: number;
	} |
	{
		serverId: number;
		callId: number;
		units: string[];
	} |
	{
		serverId: number;
		units: string[];
	} |
	{
		serverId: number;
		callId: number;
		postal: string;
	} |
	{
		serverId: number;
		callId: number;
		primary: number;
		trackPrimary: boolean;
	} |
	{
		serverId: number;
		callId: number;
		note: string;
	} |
	{
		serverId: number;
		callId: number;
	} |
	{
		serverId: number;
		isEmergency: boolean;
		caller: string;
		location: string;
		description: string;
		metaData: Record<string, string>;
	} |
	{
		serverId: number;
		signConfig: CADStreetSignStruct[];
	} |
	{
		serverId: number;
		signData: {
			ids: number[];
			text1: string;
			text2: string;
			text3: string;
		}
	} |
	{
		internalKey: string;
		accounts: { account: string }[];
	} |
	{
		apiId?: string;
		username?: string;
	} |
	{
		apiId: string;
		serverId: number;
	} |
	{
		apiId: string;
		forceClockIn: boolean;
	} |
	{
		accountId: string,
		set?: {
			primary: string[],
			secondary: string[]
		},
		add?: string[],
		remove?: string[],
	};
