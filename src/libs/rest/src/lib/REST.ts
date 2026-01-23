import { EventEmitter } from 'events';
import {
	InternalRequestData,
	// RequestMethod,
	RequestData,
	RequestManager,
	// RouteLike
} from './RequestManager';
import { AllAPITypes, AllAPITypesType, RESTEvents, RESTTypedAPIDataStructs } from './utils/constants';
import { productEnums, uuidRegex } from '../../../../constants';
import type { AgentOptions } from 'node:https';
import type { RequestInit, Response } from 'node-fetch';
// import type Collection from '@discordjs/collection';
import { Instance } from '../../../../instance/Instance';
import { CADManager } from '../../../../managers/CADManager';
import { CMSManager } from '../../../../managers/CMSManager';
import { RadioManager } from '../../../../managers/RadioManager';

/**
 * Options to be passed when creating the REST instance
 */
export interface RESTOptions {
	/**
	 * HTTPS Agent options
	 * @default {}
	 */
	agent: Omit<AgentOptions, 'keepAlive'>;
	/**
	 * The base api path, without version
	 */
	api: string;
	/**
	 * Additional headers to send for all API requests
	 * @default {}
	 */
	headers: Record<string, string>;
	/**
	 * Wether the request should be queued if there's a current ratelimit or to reject.
	 * @default true
	 */
	 rejectOnRateLimit: boolean;
}

/**
 * Data emitted on `RESTEvents.RateLimited`
 */
export interface RateLimitData {
	product: productEnums;
  type: string;
  timeTill: NodeJS.Timer;
}

export interface APIRequest {
	/**
	 * The HTTP method used in this request
	 */
	type: AllAPITypesType;
	/**
	 * Additional HTTP options for this request
	 */
	options: RequestInit;
	/**
	 * The data that was used to form the body of this request
	 */
	data: RequestData;
}

export interface InvalidRequestWarningData {
	/**
	 * Number of invalid requests that have been made in the window
	 */
	count: number;
	/**
	 * API request type which the request is for
	 */
	type: string;
	/**
	 * Product which the invalid request is for
	 */
	product: productEnums;
}

export interface RestEvents {
	invalidRequestWarning: [invalidRequestInfo: InvalidRequestWarningData];
	restDebug: [info: string];
	rateLimited: [rateLimitInfo: RateLimitData];
	request: [request: APIRequest];
	response: [request: APIRequest, response: Response];
	newListener: [name: string, listener: (...args: any) => void];
	removeListener: [name: string, listener: (...args: any) => void];
}

export interface REST {
	on: (<K extends keyof RestEvents>(event: K, listener: (...args: RestEvents[K]) => void) => this) &
		(<S extends string | symbol>(event: Exclude<S, keyof RestEvents>, listener: (...args: any[]) => void) => this);

	once: (<K extends keyof RestEvents>(event: K, listener: (...args: RestEvents[K]) => void) => this) &
		(<S extends string | symbol>(event: Exclude<S, keyof RestEvents>, listener: (...args: any[]) => void) => this);

	emit: (<K extends keyof RestEvents>(event: K, ...args: RestEvents[K]) => boolean) &
		(<S extends string | symbol>(event: Exclude<S, keyof RestEvents>, ...args: any[]) => boolean);

	off: (<K extends keyof RestEvents>(event: K, listener: (...args: RestEvents[K]) => void) => this) &
		(<S extends string | symbol>(event: Exclude<S, keyof RestEvents>, listener: (...args: any[]) => void) => this);

	removeAllListeners: (<K extends keyof RestEvents>(event?: K) => this) &
		(<S extends string | symbol>(event?: Exclude<S, keyof RestEvents>) => this);
}

export type RestManagerTypes = CADManager | CMSManager | RadioManager;

export class REST extends EventEmitter {
	public readonly requestManager: RequestManager;
	public readonly instance: Instance;
	public readonly manager: RestManagerTypes;

	public constructor(_instance: Instance, _manager: RestManagerTypes,_product: productEnums, options: RESTOptions) {
		super();
		this.instance = _instance;
		this.manager = _manager;
		this.requestManager = new RequestManager(_instance, _product, options)
			.on(RESTEvents.Debug, this.emit.bind(this, RESTEvents.Debug))
			.on(RESTEvents.RateLimited, this.emit.bind(this, RESTEvents.RateLimited))
			.on(RESTEvents.InvalidRequestWarning, this.emit.bind(this, RESTEvents.InvalidRequestWarning));

		this.on('newListener', (name, listener) => {
			if (name === RESTEvents.Request || name === RESTEvents.Response) this.requestManager.on(name, listener);
		});
		this.on('removeListener', (name, listener) => {
			if (name === RESTEvents.Request || name === RESTEvents.Response) this.requestManager.off(name, listener);
		});
	}

	/**
	 * Runs a request from the api
	 * @param type API Type Enum
	 */
	public request<K extends keyof RESTTypedAPIDataStructs>(type: K, ...args: RESTTypedAPIDataStructs[K]) {
		const apiType = AllAPITypes.find((aT) => aT.type === type);
		if (!apiType) throw new Error('Invalid API Type given for request.');
		let communityId: string | undefined;
		let apiKey: string | undefined;
		switch (apiType.product) {
			case productEnums.CAD: {
				communityId = this.instance.cadCommunityId;
				apiKey = this.instance.cadApiKey;
				break;
			}
			case productEnums.CMS: {
				communityId = this.instance.cmsCommunityId;
				apiKey = this.instance.cmsApiKey;
				break;
			}
			case productEnums.RADIO: {
				communityId = this.instance.radioCommunityId;
				apiKey = this.instance.radioApiKey;
				break;
			}
		}
		if (!communityId || !apiKey) throw new Error(`Community ID or API Key could not be found for request. P${apiType.product}`);
		// if (apiType.minVersion > this.manager.version) throw new Error(`[${type}] Subscription version too low for this API type request. Current Version: ${convertSubNumToName(this.manager.version)} Needed Version: ${convertSubNumToName(apiType.minVersion)}`);  // Verifies API Subscription Level Requirement which is deprecated currently
		const formattedData = this.formatDataArguments(apiType.type, args);
		const options: InternalRequestData = {
			id: communityId,
			key: apiKey,
			type,
			data: formattedData,
			product: apiType.product
		};
		return this.requestManager.queueRequest(options);
	}

	private formatDataArguments(type: string, args: any) {
		switch (type) {
			case 'VERIFY_WHITELIST': {
				return {
					apiId: args[0],
					accId: uuidRegex.test(args[1]) ? args[1] : undefined,
					serverId: args[2],
					discord: args[3]
				}
			}
			case 'FULL_WHITELIST': {
				return {
					serverId: args[0]
				}
			}
			case 'GET_CURRENT_SESSION': {
				return {
					serverId: args[0]
				}
			}
			case 'START_SESSION': {
				return {
					serverId: args[0],
					accId: args[1],
				}
			}
			case 'STOP_SESSION': {
				return {
					serverId: args[0],
					accId: args[1],
				}
			}
			case 'CANCEL_SESSION': {
				return {
					serverId: args[0],
					accId: args[1],
				}
			}
			case 'SET_GAME_SERVERS': {
				return args[0] ?? [];
			}
			case 'RSVP': {
				return {
					eventId: args[0],
					apiId: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4]
				}
			}
			case 'GET_COM_ACCOUNT': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4]
				};
			}
			case 'GET_ACCOUNT_RANKS': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4]
				};
			}
			case 'GET_CURRENT_CLOCK_IN': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4]
				};
			}
			case 'GET_CLOCKIN_TYPES': {
				return {};
			}
			case 'GET_LATEST_ACTIVITY': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				return {
					accId: args[0],
					type: args[1],
					serverId: args[2],
					clockInType: args[3]
				};
			}
			case 'GET_ACCOUNTS': {
				return args[0] ?? {};
			}
			case 'GET_PROFILE_FIELDS': {
				return {};
			}
			case 'GET_MY_CALL': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				return { account: args[0] };
			}
			case 'SET_CLOCK': {
				if (args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
					return args[0];
				}
				return {
					serverId: args[0],
					currentUtc: args[1],
					currentGame: args[2],
					secondsPerHour: args[3]
				};
			}
			case 'JOIN_COMMUNITY':
			case 'LEAVE_COMMUNITY': {
				const payload = args[0] && typeof args[0] === 'object' && !Array.isArray(args[0]) && 'internalKey' in args[0]
					? args[0]
					: null;
				const internalKey = payload ? payload.internalKey : args[0];
				const accountsInput = payload ? payload.accounts : args[1];
				let accounts: Array<{ account: string }> = [];
				if (Array.isArray(accountsInput)) {
					accounts = accountsInput.map((entry) => {
						if (typeof entry === 'string') {
							return { account: entry };
						}
						if (entry && typeof entry === 'object' && 'account' in entry) {
							return entry as { account: string };
						}
						return { account: String(entry) };
					});
				} else if (accountsInput) {
					if (typeof accountsInput === 'string') {
						accounts = [{ account: accountsInput }];
					} else if (typeof accountsInput === 'object' && 'account' in accountsInput) {
						accounts = [accountsInput as { account: string }];
					}
				}
				return {
					internalKey,
					accounts
				};
			}
			case 'CLOCK_IN_OUT': {
				if (args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
					return args[0];
				}
				return {
					apiId: args[0],
					accId: args[1],
					forceClockIn: args[2],
					discord: args[3],
					uniqueId: args[4],
					type: args[5],
					forceClockOut: args[6]
				};
			}
			case 'ADD_CALL_NOTE': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				return {
					serverId: args[0],
					callId: args[1],
					note: args[2],
					label: args[3]
				};
			}
			case 'CLOSE_CALL': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				return {
					serverId: args[0],
					callId: args[1]
				};
			}
			case 'UNIT_STATUS': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					const { apiId, account, status, serverId, identIds } = payload as {
						apiId?: string;
						account?: string;
						status: number;
						serverId: number;
						identIds?: number[];
					};
					return { apiId, account, status, serverId, identIds };
				}
				return {
					apiId: args[0],
					status: args[1],
					serverId: args[2],
					identIds: args[3]
				};
			}
			case 'UNIT_PANIC': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					const { apiId, account, isPanic } = payload as { apiId?: string; account?: string; isPanic: boolean };
					return { apiId, account, isPanic };
				}
				return {
					apiId: args[0],
					isPanic: args[1]
				};
			}
			case 'IDENTS_TO_GROUP': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				return payload ?? [];
			}
			case 'ATTACH_UNIT': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				const unitsOrAccount = args[2];
				const identIds = args[3];
				const account = typeof unitsOrAccount === 'string' && !Array.isArray(unitsOrAccount) ? unitsOrAccount : undefined;
				const units = Array.isArray(unitsOrAccount) ? unitsOrAccount : undefined;
				return {
					serverId: args[0],
					callId: args[1],
					units,
					account,
					identIds
				};
			}
			case 'DETACH_UNIT': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				const unitsOrAccount = args[1];
				const account = typeof unitsOrAccount === 'string' && !Array.isArray(unitsOrAccount) ? unitsOrAccount : undefined;
				const units = Array.isArray(unitsOrAccount) ? unitsOrAccount : undefined;
				return {
					serverId: args[0],
					units,
					account
				};
			}
			case 'CHECK_COM_APIID': {
				return {
					apiId: args[0]
				};
			}
			case 'SET_ACCOUNT_RANKS': {
				return {
					accId: args[0],
					set: args[1],
					add: args[2],
					remove: args[3],
					apiId: args[4],
					username: args[5],
					discord: args[6],
					uniqueId: args[7],
				};
			}
			case 'VERIFY_SECRET': {
				return {
					secret: args[0],
				};
			}
			case 'GET_FORM_TEMPLATE_SUBMISSIONS': {
				return {
					templateId: args[0],
					skip: args[1],
					take: args[2],
				};
			}
			case 'GET_FORM_LOCK_STATUS': {
				return {
					templateId: args[0],
				};
			}
			case 'SET_FORM_LOCK_STATUS': {
				return {
					templateId: args[0],
					state: args[1],
				};
			}
			case 'CHANGE_FORM_STAGE': {
				return {
					accId: args[0],
					formId: args[1],
					newStageId: args[2],
					apiId: args[3],
					username: args[4],
					discord: args[5],
					uniqueId: args[6],
				};
			}
			case 'BAN_ACCOUNT': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4]
				};
			}
			case 'KICK_ACCOUNT': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4]
				};
			}
			case 'LOOKUP': {
				const payload = args[0];
				if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
					return payload;
				}
				return {
					id: args[0],
					uuid: args[1]
				}
			}
			case 'EDIT_ACC_PROFLIE_FIELDS': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4],
					profileFields: args[5]
				}
			}
			case 'SET_ACCOUNT_NAME': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discord: args[3],
					uniqueId: args[4],
					newName: args[5]
				}
			}
			case 'FORCE_SYNC': {
				return {
					apiId: args[0],
					username: args[1],
					accId: args[2],
					discordId: args[3],
					uniqueId: args[4],
				}
			}
			case 'TRIGGER_PROMOTION_FLOWS': {
				const payload = args[0];
				if (!Array.isArray(payload)) {
					throw new Error('TRIGGER_PROMOTION_FLOWS requires an array of promotion flow payloads.');
				}
				return payload;
			}
			case 'GET_PROMOTION_FLOWS': {
				return [];
			}
			case 'GET_CUSTOM_LOG_TYPES': {
				return [];
			}
			case 'ERLC_GET_ONLINE_PLAYERS': {
				return {
					robloxJoinCode: args[0]
				}
			}
			case 'ERLC_GET_PLAYER_QUEUE': {
				return {
					robloxJoinCode: args[0]
				}
			}
			case 'ERLC_ADD_NEW_RECORD': {
				return {
					robloxJoinCode: args[0],
					executerDiscordId: args[1],
					type: args[2],
					reason: args[3],
					playerDiscordId: args[4],
					playerRobloxId: args[5],
					points: args[6],
				}
			}
			case 'ERLC_EXECUTE_COMMAND': {
				const payload = args[0];
				if (!Array.isArray(payload)) {
					throw new Error('ERLC_EXECUTE_COMMAND requires an array of command payloads.');
				}
				return payload.map((cmd) => {
					const robloxJoinCode = cmd.robloxJoinCode;
					if (typeof robloxJoinCode !== 'string' || robloxJoinCode.length === 0) {
						throw new Error('ERLC_EXECUTE_COMMAND requires each command to include a valid robloxJoinCode.');
					}
					return {
						...cmd,
						robloxJoinCode
					};
				});
			}
			case 'ERLC_TEAMS_LOCK': {
				return {
					robloxJoinCode: args[0],
					team: args[1],
					maxPlayers: args[2],
				}
			}
			case 'ERLC_TEAMS_UNLOCK': {
				return {
					robloxJoinCode: args[0],
					team: args[1],
				}
			}
			case 'RADIO_GET_COMMUNITY_CHANNELS':
			case 'RADIO_GET_CONNECTED_USERS':
			case 'RADIO_GET_SERVER_SUBSCRIPTION_FROM_IP': {
				return undefined;
			}
			case 'RADIO_GET_CONNECTED_USER': {
				return {
					roomId: args[0],
					identity: args[1]
				}
			}
			case 'RADIO_SET_USER_CHANNELS': {
				return {
					roomId: args[0],
					identity: args[1],
					options: args[2] ?? {}
				}
			}
			case 'RADIO_SET_USER_DISPLAY_NAME': {
				return {
					accId: args[0],
					displayName: args[1]
				}
			}
			case 'RADIO_SET_SERVER_IP': {
				return {
					pushUrl: args[0]
				}
			}
			case 'RADIO_SET_IN_GAME_SPEAKER_LOCATIONS': {
				return {
					locations: args[0],
					token: args[1]
				}
			}
			case 'PLAY_TONE': {
				return {
					roomId: args[0],
					tones: args[1],
					playTo: args[2]
				}
			}
			default: {
				return args;
			}
		}
	}
}
