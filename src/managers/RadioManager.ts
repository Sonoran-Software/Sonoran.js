import { Instance } from '../instance/Instance';
import { APIError, DefaultRadioRestOptions, REST } from '../libs/rest/src';
import { BaseManager } from './BaseManager';
import * as globalTypes from '../constants';
import type { Mutable } from '../constants';

/**
 * Manages all Sonoran Radio API interactions.
 */
export class RadioManager extends BaseManager {
  public readonly ready: boolean = false;
  public readonly failReason: unknown = null;
  public rest: REST | undefined;

  constructor(instance: Instance) {
    super(instance);

    this.rest = new REST(instance, this, globalTypes.productEnums.RADIO, DefaultRadioRestOptions);
    void this.buildManager(instance);
  }

  protected async buildManager(instance: Instance) {
    const mutableThis = this as Mutable<RadioManager>;
    try {
      mutableThis.ready = true;
      instance.isRadioSuccessful = true;
      instance.emit('RADIO_SETUP_SUCCESSFUL');
    } catch (err) {
      mutableThis.failReason = err;
      instance.emit('RADIO_SETUP_UNSUCCESSFUL', err);
      throw err;
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

  private assertPositiveInteger(value: number, label: string): void {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`${label} must be a positive integer.`);
    }
  }

  private resolveRadioServerId(serverId?: number): number {
    return serverId ?? this.instance.radioDefaultServerId;
  }

  private async parseRadioV2Response(response: Response): Promise<unknown> {
    if (response.status === 204) {
      return null;
    }
    const contentType = response.headers.get('Content-Type') ?? '';
    if (contentType.startsWith('application/json') || contentType.startsWith('application/problem+json')) {
      return response.json();
    }
    return response.text();
  }

  private async executeRadioV2Request<T = unknown>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      authenticated?: boolean;
    } = {},
  ): Promise<globalTypes.CADStandardResponse<T>> {
    const baseUrl = this.instance.radioApiUrl?.replace(/\/+$/u, '');
    if (!baseUrl) {
      throw new Error('Radio API URL is not configured.');
    }

    const headers = this.headersInitToRecord(this.instance.apiHeaders);
    headers.Accept = 'application/json';

    if (options.authenticated !== false) {
      if (!this.instance.radioApiKey) {
        throw new Error('Radio API key is not configured.');
      }
      headers.Authorization = `Bearer ${this.instance.radioApiKey}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${baseUrl}/${path.replace(/^\/+/u, '')}`, fetchOptions);
    const parsedResponse = await this.parseRadioV2Response(response);

    if (response.ok) {
      return { success: true, data: parsedResponse as T };
    }
    return { success: false, reason: parsedResponse };
  }

  /**
   * Retrieves the configured community channel groups and channels.
   */
  public async getCommunityChannels(): Promise<globalTypes.RadioGetCommunityChannelsPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_GET_COMMUNITY_CHANNELS');
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
   * Retrieves all connected users for the community.
   */
  public async getConnectedUsers(): Promise<globalTypes.RadioGetConnectedUsersPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_GET_CONNECTED_USERS');
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
   * Retrieves a specific connected user by room id and identity.
   * @param {number} roomId Multi-server room id.
   * @param {string} identity User account UUID.
   */
  public async getConnectedUser(roomId: number, identity: string): Promise<globalTypes.RadioGetConnectedUserPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_GET_CONNECTED_USER', roomId, identity);
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
   * Updates a user's transmit and scanned channel configuration.
   * @param {number} roomId Multi-server room id.
   * @param {string} identity The user's UUID.
   * @param {RadioSetUserChannelsOptions} options Transmit and scan channel configuration.
   */
  public async setUserChannels(roomId: number, identity: string, options: globalTypes.RadioSetUserChannelsOptions = {}): Promise<globalTypes.RadioSetUserChannelsPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_SET_USER_CHANNELS', roomId, identity, options);
        resolve({ success: true, result: response?.result ?? response });
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
   * Updates a user's display name.
   * @param {string} accId The user's account UUID.
   * @param {string} displayName The new display name.
   */
  public async setUserDisplayName(accId: string, displayName: string): Promise<globalTypes.RadioSetUserDisplayNamePromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_SET_USER_DISPLAY_NAME', accId, displayName);
        resolve({ success: true, result: response?.result ?? response });
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
   * Approves existing pending community members.
   * @param {string[]} accIds Account UUIDs to approve.
   */
  public async approveMembers(accIds: string[]): Promise<globalTypes.RadioMemberActionPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_APPROVE_MEMBERS', accIds);
        resolve({ success: true, result: response?.result ?? response });
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
   * Removes members from the community.
   * @param {string[]} accIds Account UUIDs to remove.
   */
  public async kickMembers(accIds: string[]): Promise<globalTypes.RadioMemberActionPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_KICK_MEMBERS', accIds);
        resolve({ success: true, result: response?.result ?? response });
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
   * Bans members from the community.
   * @param {string[]} accIds Account UUIDs to ban.
   */
  public async banMembers(accIds: string[]): Promise<globalTypes.RadioMemberActionPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_BAN_MEMBERS', accIds);
        resolve({ success: true, result: response?.result ?? response });
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
   * Updates stored display names for community members.
   * @param {RadioMemberDisplayNameChange[]} accNicknames Display name updates to apply.
   */
  public async setMemberDisplayNames(accNicknames: globalTypes.RadioMemberDisplayNameChange[]): Promise<globalTypes.RadioMemberActionPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_SET_MEMBER_DISPLAY_NAMES', accNicknames);
        resolve({ success: true, result: response?.result ?? response });
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
   * Updates community permissions and private channel access for members.
   * @param {RadioMemberPermissionChange[]} userPerms Permission updates to apply.
   */
  public async setMemberPermissions(userPerms: globalTypes.RadioMemberPermissionChange[]): Promise<globalTypes.RadioMemberActionPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_SET_MEMBER_PERMISSIONS', userPerms);
        resolve({ success: true, result: response?.result ?? response });
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
   * Retrieves the community subscription level determined by the calling server's IP.
   */
  public async getServerSubscriptionFromIp(): Promise<globalTypes.RadioGetServerSubscriptionFromIpPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_GET_SERVER_SUBSCRIPTION_FROM_IP');
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
   * Sets the push event URL for the community.
   * @param {string} pushUrl The server push URL.
   */
  public async setServerIp(pushUrl: string): Promise<globalTypes.RadioSetServerIpPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_SET_SERVER_IP', pushUrl);
        resolve({ success: true, result: response?.result ?? response });
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
   * Sets the available in-game speaker locations for tone dispatching.
   * @param {RadioSpeakerLocation[]} locations Collection of speaker locations.
   * @param {string} [token] Optional bearer token for authorization. Defaults to the community API key.
   */
  public async setInGameSpeakerLocations(locations: globalTypes.RadioSpeakerLocation[], token?: string): Promise<globalTypes.RadioSetInGameSpeakerLocationsPromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('RADIO_SET_IN_GAME_SPEAKER_LOCATIONS', locations, token);
        resolve({ success: true, result: response?.result ?? response });
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
   * Plays one or more tones to radio channels, groups, or in-game speakers.
   * @param {number} roomId Multi-server room id for tone playback.
   * @param {(number | globalTypes.RadioTone)[]} tones Tone identifiers or tone payloads to play.
   * @param {globalTypes.RadioTonePlayTarget[]} playTo Targets that should receive the tones.
   */
  public async playTone(roomId: number, tones: Array<number | globalTypes.RadioTone>, playTo: globalTypes.RadioTonePlayTarget[]): Promise<globalTypes.RadioPlayTonePromiseResult> {
    return new Promise(async (resolve, reject) => {
      try {
        const response: any = await this.rest?.request('PLAY_TONE', roomId, tones, playTo);
        resolve({ success: true, result: response?.result ?? response });
      } catch (err) {
        if (err instanceof APIError) {
          resolve({ success: false, reason: err.response });
        } else {
          reject(err);
        }
      }
    });
  }

  public async getCommunityChannelsV2(serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('GET', `v2/servers/${resolvedServerId}/channels`);
  }

  public async getConnectedUsersV2(serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('GET', `v2/servers/${resolvedServerId}/connected-users`);
  }

  public async getConnectedUserV2(roomId: number, identity: string, serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    this.assertPositiveInteger(roomId, 'roomId');
    if (!identity) {
      throw new Error('identity is required.');
    }
    return this.executeRadioV2Request('GET', `v2/servers/${resolvedServerId}/rooms/${roomId}/users/${encodeURIComponent(identity)}`);
  }

  public async setUserChannelsV2(
    roomId: number,
    identity: string,
    options: globalTypes.RadioSetUserChannelsOptions = {},
    serverId?: number,
  ): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    this.assertPositiveInteger(roomId, 'roomId');
    if (!identity) {
      throw new Error('identity is required.');
    }
    return this.executeRadioV2Request('PATCH', `v2/servers/${resolvedServerId}/rooms/${roomId}/users/${encodeURIComponent(identity)}/channels`, {
      body: options,
    });
  }

  public async setUserDisplayNameV2(data: { accId: string; displayName: string; serverId?: number }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(data.serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    if (!data.accId) {
      throw new Error('accId is required.');
    }
    if (!data.displayName) {
      throw new Error('displayName is required.');
    }
    return this.executeRadioV2Request('PATCH', `v2/servers/${resolvedServerId}/users/display-name`, {
      body: {
        accId: data.accId,
        displayName: data.displayName,
      },
    });
  }

  public async approveMembersV2(accIds: string[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('POST', `v2/servers/${resolvedServerId}/members/approve`, { body: { accIds } });
  }

  public async kickMembersV2(accIds: string[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('POST', `v2/servers/${resolvedServerId}/members/kick`, { body: { accIds } });
  }

  public async banMembersV2(accIds: string[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('POST', `v2/servers/${resolvedServerId}/members/ban`, { body: { accIds } });
  }

  public async setMemberDisplayNamesV2(accNicknames: globalTypes.RadioMemberDisplayNameChange[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('PATCH', `v2/servers/${resolvedServerId}/members/display-names`, {
      body: { accNicknames },
    });
  }

  public async setMemberPermissionsV2(userPerms: globalTypes.RadioMemberPermissionChange[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('PATCH', `v2/servers/${resolvedServerId}/members/permissions`, {
      body: { userPerms },
    });
  }

  public async getServerSubscriptionFromIpV2(): Promise<globalTypes.CADStandardResponse> {
    return this.executeRadioV2Request('GET', 'v2/server-subscriptions/by-ip', { authenticated: false });
  }

  public async setServerIpV2(data: {
    roomId: number;
    serverPort: number;
    overridePushUrl?: string;
    pushUrl?: string;
    nickname?: string;
    serverId?: number;
  }): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(data.serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    this.assertPositiveInteger(data.roomId, 'roomId');
    this.assertPositiveInteger(data.serverPort, 'serverPort');
    const { serverId: _, ...body } = data;
    return this.executeRadioV2Request('POST', `v2/servers/${resolvedServerId}/server-ip`, { body });
  }

  public async setInGameSpeakerLocationsV2(locations: globalTypes.RadioSpeakerLocation[], serverId?: number): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    return this.executeRadioV2Request('PUT', `v2/servers/${resolvedServerId}/speakers`, {
      body: { locations },
    });
  }

  public async playToneV2(
    roomId: number,
    tones: Array<number | globalTypes.RadioTone>,
    playTo: globalTypes.RadioTonePlayTarget[],
    serverId?: number,
  ): Promise<globalTypes.CADStandardResponse> {
    const resolvedServerId = this.resolveRadioServerId(serverId);
    this.assertPositiveInteger(resolvedServerId, 'serverId');
    this.assertPositiveInteger(roomId, 'roomId');
    return this.executeRadioV2Request('POST', `v2/servers/${resolvedServerId}/tones/play`, {
      body: { roomId, tones, playTo },
    });
  }
}
