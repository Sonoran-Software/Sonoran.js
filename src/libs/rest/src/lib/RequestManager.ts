import { Collection } from '@discordjs/collection';
// import { DiscordSnowflake } from '@sapphire/snowflake';
import { EventEmitter } from 'events';
// import type { RequestInit, BodyInit } from 'node-fetch';

import type { Instance } from '../../../../instance/Instance';
import { RESTOptions, RateLimitData, RestEvents } from './REST';
import { DefaultCADRestOptions, DefaultCMSRestOptions, DefaultRadioRestOptions, AllAPITypes/**, RESTTypedAPIDataStructs, PossibleRequestData*/ } from './utils/constants';
import type { AllAPITypeData } from './utils/constants';
import { productEnums } from '../../../../constants';
// import { APIError, HTTPError } from './errors';
import { IHandler } from './handlers/IHandler';
import { SequentialHandler } from './handlers/SequentialHandler';
import { cloneObject } from '../../../../utils/utils';

export type RouteLike = `/${string}`;

export const enum RequestMethod {
	Delete = 'delete',
	Get = 'get',
	Patch = 'patch',
	Post = 'post',
	Put = 'put',
}

export type ReqDataType = Array<unknown> | unknown;

export interface RequestData {
  id: string;
  key: string;
  type: string;
  data: any;
  internalKey?: string;
}

export interface InternalRequestData extends RequestData {
  product: productEnums;
}

export interface RequestHeaders {
  'User-Agent': string;
}

export interface APIData {
  requestTypeId: string;
  typePath: string;
  fullUrl: string;
  method: string;
  fetchOptions: RequestInit;
  data: RequestData;
  product: productEnums;
  type: string;
}

export interface RequestManager {
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

export class RequestManager extends EventEmitter {
  public readonly ratelimitedTypes = new Collection<string, RateLimitData>();
  public readonly handlers = new Collection<string, IHandler>();
  public readonly product: productEnums;
  public readonly options: RESTOptions;
  private instance: Instance;

  constructor(_instance: Instance, _product: productEnums, options: RESTOptions) {
    super();
    this.product = _product;
    this.instance = _instance;
    switch (_product) {
      case productEnums.CAD: {
        this.options = { ...DefaultCADRestOptions, ...options };
        break;
      }
      case productEnums.CMS: {
        this.options = { ...DefaultCMSRestOptions, ...options };
        break;
      }
      case productEnums.RADIO: {
        this.options = { ...DefaultRadioRestOptions, ...options };
        break;
      }
      default: {
        throw new Error('No Product provided for RequestManager initialization');
      }
    }
  }

  public async queueRequest(request: InternalRequestData): Promise<unknown> {
    let requestData = request as RequestData;
    const resolvedData: APIData = RequestManager.resolveRequestData(this.instance, request.type, request.product, requestData);
    const handler = this.handlers.get(`${resolvedData.typePath}:${String(request.product)}`) ?? this.createHandler(resolvedData);
    return handler.queueRequest(resolvedData.fullUrl, resolvedData.fetchOptions as any, resolvedData);
  }

  public onRateLimit(id: string, rateLimitData: RateLimitData): void {
    this.ratelimitedTypes.set(id, rateLimitData);
  }

  public removeRateLimit(id: string): void {
    this.ratelimitedTypes.delete(id);
  }

  private createHandler(data: APIData) {
    const queue = new SequentialHandler(this, data);
    this.handlers.set(queue.id, queue);
    return queue;
  }

  private static resolveRequestData(instance: Instance, type: string, product: productEnums, data: RequestData): APIData {
    let apiURL: string | boolean = false;
    let apiData: APIData = {
      requestTypeId: `${type}:${String(product)}`,
      typePath: '',
      fullUrl: '',
      method: '',
      fetchOptions: {},
      data,
      product,
      type
    };

    switch (product) {
      case productEnums.CAD:
        apiURL = instance.cadApiUrl;
        break;
      case productEnums.CMS:
        apiURL = instance.cmsApiUrl;
        break;
      case productEnums.RADIO:
        apiURL = instance.radioApiUrl;
        break;
    }

    const findType = AllAPITypes.find((_type) => _type.type === type);
    if (findType) {
      if (product === productEnums.RADIO) {
        return RequestManager.resolveRadioRequest(instance, apiURL, findType, data, apiData);
      }
      apiData.fullUrl = `${apiURL}/${findType.path}`;
      apiData.method = findType.method;
      apiData.fetchOptions.method = findType.method;
      apiData.typePath = findType.path;

      const clonedData = cloneObject(data.data);

      switch (findType.type) {
        case 'SET_SERVERS': {
          apiData.data.data = clonedData;
          break;
        }
        case 'SET_GAME_SERVERS': {
          apiData.data.data = clonedData;
          break;
        }
        case 'TRIGGER_PROMOTION_FLOWS': {
          apiData.data.data = clonedData;
          break;
        }
        case 'GET_PROMOTION_FLOWS': {
          apiData.data.data = [];
          break;
        }
        case 'GET_CLOCKIN_TYPES': {
          apiData.data.data = [];
          break;
        }
        case 'ERLC_EXECUTE_COMMAND': {
          apiData.data.data = clonedData;
          break;
        }
        case 'SET_PENAL_CODES': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'SET_API_ID': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'NEW_RECORD': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'EDIT_RECORD': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'LOOKUP_INT': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'LOOKUP': {
          const rawLookup = data.data;
          if (Array.isArray(rawLookup)) {
            apiData.data.data = rawLookup;
          } else if (rawLookup !== undefined && rawLookup !== null) {
            apiData.data.data = [rawLookup];
          } else {
            apiData.data.data = [];
          }
          break;
        }
        case 'SET_ACCOUNT_PERMISSIONS': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'BAN_USER': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'AUTH_STREETSIGNS': {
          apiData.data.data = clonedData;
          break;
        }
		case 'SET_POSTALS': {
		  apiData.data.data = [clonedData[0]];
		  break;
		}
		case 'SET_CLOCK': {
		  apiData.data.data = Array.isArray(clonedData) ? clonedData : [clonedData];
		  break;
		}
		case 'JOIN_COMMUNITY':
		case 'LEAVE_COMMUNITY': {
		  const internalKey = clonedData?.internalKey;
		  if (internalKey !== undefined) {
		    apiData.data.internalKey = internalKey;
		  }
		  const accountsSource = clonedData?.accounts;
		  const accountsArray = Array.isArray(accountsSource) ? accountsSource : accountsSource ? [accountsSource] : [];
		  apiData.data.data = accountsArray.map((entry: any) => {
		    if (typeof entry === 'string') {
		      return { account: entry };
		    }
		    if (entry && typeof entry === 'object' && 'account' in entry) {
		      return entry;
		    }
		    return { account: String(entry) };
		  });
		  break;
		}
		case 'NEW_CHARACTER': {
		  apiData.data.data = [clonedData[0]];
		  break;
		}
        case 'EDIT_CHARACTER': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'MODIFY_IDENTIFIER': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'ADD_BLIP': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'MODIFY_BLIP': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'GET_CALLS': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'GET_ACTIVE_UNITS': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'NEW_DISPATCH': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        case 'UNIT_LOCATION': {
          apiData.data.data = [clonedData[0]];
          break;
        }
        default: {
          if (data.data) {
            if (Array.isArray(data.data)) {
              if (data.data.length > 0) {
                apiData.data.data = [ clonedData ];
              } else {
                apiData.data.data = [];
              }
            } else {
              apiData.data.data = [ clonedData ];
            }
          } else {
            apiData.data.data = [];
          }
          break;
        }
      }
    }

    apiData.fetchOptions.body = JSON.stringify(apiData.data);
    apiData.fetchOptions.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...instance.apiHeaders
    };

    return apiData;
  }

  private static resolveRadioRequest(instance: Instance, apiURL: string | boolean, apiType: AllAPITypeData, request: RequestData, apiData: APIData): APIData {
    if (!apiURL || typeof apiURL !== 'string') {
      throw new Error('Radio API URL could not be resolved for request.');
    }

    const rawData = request.data;
    const payload: any =
      rawData == null ? {} : (typeof rawData === 'object' ? cloneObject(rawData) : rawData);
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };

    const applyHeaders = (source: unknown) => {
      if (!source) return;
      if (Array.isArray(source)) {
        for (const [key, value] of source) {
          headers[key] = value;
        }
        return;
      }
      if (typeof source === 'object' && source !== null && 'forEach' in source && typeof (source as any).forEach === 'function') {
        (source as any).forEach((value: string, key: string) => {
          headers[key] = value;
        });
        return;
      }
      Object.assign(headers, source as Record<string, string>);
    };

    applyHeaders(instance.apiHeaders);

    let method = apiType.method;
    let path = apiType.path;
    let body: unknown;

    const ensureAuth = () => {
      if (!request.id || !request.key) {
        throw new Error('Community ID or API Key could not be found for request.');
      }
      return {
        id: request.id,
        key: request.key,
        encodedId: encodeURIComponent(request.id),
        encodedKey: encodeURIComponent(request.key)
      };
    };

    const encodeSegment = (value: string | number) => encodeURIComponent(String(value));

    switch (apiType.type) {
      case 'RADIO_GET_COMMUNITY_CHANNELS': {
        const auth = ensureAuth();
        path = `${apiType.path}/${auth.encodedId}/${auth.encodedKey}`;
        method = 'GET';
        break;
      }
      case 'RADIO_GET_CONNECTED_USERS': {
        const auth = ensureAuth();
        path = `${apiType.path}/${auth.encodedId}/${auth.encodedKey}`;
        method = 'GET';
        break;
      }
      case 'RADIO_GET_CONNECTED_USER': {
        const auth = ensureAuth();
        const roomIdRaw = payload?.roomId ?? payload?.roomID;
        if (roomIdRaw === undefined) {
          throw new Error('roomId is required for RADIO_GET_CONNECTED_USER requests.');
        }
        const roomIdNumeric = typeof roomIdRaw === 'number' ? roomIdRaw : Number(roomIdRaw);
        if (Number.isNaN(roomIdNumeric)) {
          throw new Error('roomId must be a number for RADIO_GET_CONNECTED_USER requests.');
        }
        const identity = payload?.identity;
        if (!identity) {
          throw new Error('identity is required for RADIO_GET_CONNECTED_USER requests.');
        }
        path = `${apiType.path}/${auth.encodedId}/${auth.encodedKey}/${encodeSegment(roomIdNumeric)}/${encodeSegment(identity)}`;
        method = 'GET';
        break;
      }
      case 'RADIO_SET_USER_CHANNELS': {
        const auth = ensureAuth();
        const roomIdRaw = payload?.roomId ?? payload?.roomID;
        if (roomIdRaw === undefined) {
          throw new Error('roomId is required for RADIO_SET_USER_CHANNELS requests.');
        }
        const roomIdNumeric = typeof roomIdRaw === 'number' ? roomIdRaw : Number(roomIdRaw);
        if (Number.isNaN(roomIdNumeric)) {
          throw new Error('roomId must be a number for RADIO_SET_USER_CHANNELS requests.');
        }
        const identity = payload?.identity;
        if (!identity) {
          throw new Error('identity is required for RADIO_SET_USER_CHANNELS requests.');
        }
        const options = payload?.options ?? {};
        path = `${apiType.path}/${auth.encodedId}/${auth.encodedKey}/${encodeSegment(roomIdNumeric)}/${encodeSegment(identity)}`;
        method = 'POST';
        const requestBody: Record<string, unknown> = {};
        if (options?.transmit !== undefined) {
          requestBody.transmit = options.transmit;
        }
        if (options?.scan !== undefined) {
          requestBody.scan = options.scan;
        }
        body = requestBody;
        break;
      }
      case 'RADIO_SET_USER_DISPLAY_NAME': {
        const auth = ensureAuth();
        const accId = payload?.accId;
        const displayName = payload?.displayName;
        if (!accId || !displayName) {
          throw new Error('accId and displayName are required for RADIO_SET_USER_DISPLAY_NAME requests.');
        }
        method = 'POST';
        body = {
          id: auth.id,
          key: auth.key,
          accId,
          displayName
        };
        path = apiType.path;
        break;
      }
      case 'RADIO_GET_SERVER_SUBSCRIPTION_FROM_IP': {
        method = 'GET';
        path = apiType.path;
        break;
      }
      case 'RADIO_SET_SERVER_IP': {
        const auth = ensureAuth();
        const pushUrl = payload?.pushUrl;
        if (!pushUrl) {
          throw new Error('pushUrl is required for RADIO_SET_SERVER_IP requests.');
        }
        method = 'POST';
        body = {
          id: auth.id,
          key: auth.key,
          pushUrl
        };
        path = apiType.path;
        break;
      }
      case 'RADIO_SET_IN_GAME_SPEAKER_LOCATIONS': {
        const auth = ensureAuth();
        const locations = payload?.locations;
        if (!Array.isArray(locations)) {
          throw new Error('locations array is required for RADIO_SET_IN_GAME_SPEAKER_LOCATIONS requests.');
        }
        method = 'POST';
        body = {
          id: auth.id,
          key: auth.key,
          locations
        };
        const token = payload?.token ?? auth.key;
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        path = apiType.path;
        break;
      }
      case 'PLAY_TONE': {
        const auth = ensureAuth();
        const roomIdRaw = payload?.roomId;
        if (roomIdRaw === undefined || roomIdRaw === null) {
          throw new Error('roomId is required for PLAY_TONE requests.');
        }
        const roomIdNumber = typeof roomIdRaw === 'number' ? roomIdRaw : Number(roomIdRaw);
        if (Number.isNaN(roomIdNumber)) {
          throw new Error('roomId must be a number for PLAY_TONE requests.');
        }
        const tones = payload?.tones;
        if (!Array.isArray(tones) || tones.length === 0) {
          throw new Error('tones array is required for PLAY_TONE requests.');
        }
        const playTo = payload?.playTo;
        if (!Array.isArray(playTo) || playTo.length === 0) {
          throw new Error('playTo array is required for PLAY_TONE requests.');
        }
        method = 'POST';
        body = {
          id: auth.id,
          key: auth.key,
          roomId: roomIdNumber,
          tones,
          playTo
        };
        path = apiType.path;
        break;
      }
      default: {
        throw new Error(`Unsupported radio API type received: ${apiType.type}`);
      }
    }

    apiData.typePath = path;
    apiData.fullUrl = `${apiURL}/${path}`;
    apiData.method = method;
    apiData.fetchOptions.method = method;
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      apiData.fetchOptions.body = JSON.stringify(body);
    }
    apiData.fetchOptions.headers = headers;
    return apiData;
  }

  debug(log: string) {
    return this.instance._debugLog(log);
  }
}
