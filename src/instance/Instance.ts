import EventEmitter from 'events';

import * as globalTypes from '../constants';
import * as InstanceTypes from './instance.types';
import { CADManager } from '../managers/CADManager';
import { CMSManager } from '../managers/CMSManager';
import { RadioManager } from '../managers/RadioManager';
import { debugLog } from '../utils';

export class Instance extends EventEmitter {
  public cadCommunityId: string | undefined;
  public cadApiKey: string | undefined;
  public cadApiUrl: string = 'https://api.sonorancad.com';
  public cadDefaultServerId: number = 1;
  public isCADSuccessful: boolean = false;
  public cmsCommunityId: string | undefined;
  public cmsApiKey: string | undefined;
  public cmsApiUrl: string = 'https://api.sonorancms.com';
  public cmsDefaultServerId: number = 1;
  public isCMSSuccessful: boolean = false;
  public radioCommunityId: string | undefined;
  public radioApiKey: string | undefined;
  public radioApiUrl: string = 'https://api.sonoranradio.com';
  public isRadioSuccessful: boolean = false;

  public cad: CADManager | undefined;
  public cms: CMSManager | undefined;
  public radio: RadioManager | undefined;

  public debug: boolean = false;
  public apiHeaders: HeadersInit = {};

  constructor(options: InstanceTypes.InstanceOptions) {
    super({ captureRejections: true });
    if (options.debug) {
      this.debug = options.debug;
    }
    if (Object.prototype.hasOwnProperty.call(options, 'apiHeaders') && options.apiHeaders !== undefined) {
      this.apiHeaders = options.apiHeaders;
    }
    if (Object.prototype.hasOwnProperty.call(options, 'apiKey') && Object.prototype.hasOwnProperty.call(options, 'communityId')) {
      if (Object.prototype.hasOwnProperty.call(options, 'product')) {
        switch (options.product) {
          case globalTypes.productEnums.CAD: {
            this.cadCommunityId = options.communityId;
            this.cadApiKey = options.apiKey;
            if (options.serverId !== undefined) {
              this._debugLog(`Overriding default server id... ${options.serverId}`);
              this.cadDefaultServerId = options.serverId;
            }
            if (Object.prototype.hasOwnProperty.call(options, 'cadApiUrl') && typeof options.cadApiUrl === 'string') {
              this._debugLog(`Overriding CAD API Url... ${options.cadApiUrl}`);
              this.cadApiUrl = options.cadApiUrl;
            }
            this._debugLog('About to initialize instance.');
            this.initialize();
            break;
          }
          case globalTypes.productEnums.CMS: {
            this.cmsCommunityId = options.communityId;
            this.cmsApiKey = options.apiKey;
            if (options.serverId !== undefined) {
              this._debugLog(`Overriding default server id... ${options.serverId}`);
              this.cmsDefaultServerId = options.serverId;
            }
            if (Object.prototype.hasOwnProperty.call(options, 'cmsApiUrl') && typeof options.cmsApiUrl === 'string') {
              this._debugLog(`Overriding CMS API URL... ${options.cmsApiUrl}`);
              this.cmsApiUrl = options.cmsApiUrl;
            }
            this.initialize();
            break;
          }
          case globalTypes.productEnums.RADIO: {
            this.radioCommunityId = options.communityId;
            this.radioApiKey = options.apiKey;
            if (Object.prototype.hasOwnProperty.call(options, 'radioApiUrl') && typeof options.radioApiUrl === 'string') {
              this._debugLog(`Overriding Radio API URL... ${options.radioApiUrl}`);
              this.radioApiUrl = options.radioApiUrl;
            }
            this._debugLog('About to initialize instance.');
            this.initialize();
            break;
          }
          default: {
            throw new Error('Invalid product enum given for constructor.');
          }
        }
      } else {
        throw new Error('No product enum given when instancing.');
      }
    } else {
      this.cadCommunityId = options.cadCommunityId;
      this.cadApiKey = options.cadApiKey;
      this.cmsCommunityId = options.cmsCommunityId;
      this.cmsApiKey = options.cmsApiKey;
      this.radioCommunityId = options.radioCommunityId;
      this.radioApiKey = options.radioApiKey;

      if (options.cadDefaultServerId !== undefined) {
        this._debugLog(`Overriding default CAD server id... ${options.serverId}`);
        this.cadDefaultServerId = options.cadDefaultServerId;
      }
      if (options.cmsDefaultServerId !== undefined) {
        this._debugLog(`Overriding default CMS server id... ${options.serverId}`);
        this.cmsDefaultServerId = options.cmsDefaultServerId;
      }
      if (Object.prototype.hasOwnProperty.call(options, 'cadApiUrl') && typeof options.cadApiUrl === 'string') {
        this._debugLog(`Overriding CAD API Url... ${options.cadApiUrl}`);
        this.cadApiUrl = options.cadApiUrl;
      }
      if (Object.prototype.hasOwnProperty.call(options, 'cmsApiUrl') && typeof options.cmsApiUrl === 'string') {
        this._debugLog(`Overriding CMS API URL... ${options.cmsApiUrl}`);
        this.cmsApiUrl = options.cmsApiUrl;
      }
      if (Object.prototype.hasOwnProperty.call(options, 'radioApiUrl') && typeof options.radioApiUrl === 'string') {
        this._debugLog(`Overriding Radio API URL... ${options.radioApiUrl}`);
        this.radioApiUrl = options.radioApiUrl;
      }
      this.initialize();
    }
  }



  private initialize() {
    if (this.cadCommunityId && this.cadApiKey && this.cadApiUrl) {
      this._debugLog('About to initialize CAD Manager');
      this.cad = new CADManager(this);
    } else {
      this._debugLog('Not initializing CAD Manager due to a missing community id, api key, or api url.');
    }
    if (this.cmsCommunityId && this.cmsApiKey && this.cmsApiUrl) {
      this._debugLog('About to initialize CMS Manager');
      this.cms = new CMSManager(this);
    } else {
      this._debugLog('Not initializing CMS Manager due to a missing community id, api key, or api url.');
    }
    if (this.radioCommunityId && this.radioApiKey && this.radioApiUrl) {
      this._debugLog('About to initialize Radio Manager');
      this.radio = new RadioManager(this);
    } else {
      this._debugLog('Not initializing Radio Manager due to a missing community id, api key, or api url.');
    }
  }

  public _debugLog(message: string): void {
    if (this.debug) {
      debugLog(message);
    }
  }
}
