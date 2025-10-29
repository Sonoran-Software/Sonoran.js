import * as globalTypes from '../constants';

export type InstanceOptions = {
  communityId?: string;
  apiKey?: string;
  product?: globalTypes.productEnums;
  serverId?: number;
  cadCommunityId?: string;
  cadApiKey?: string;
  cadApiUrl?: string;
  cadDefaultServerId?: number;
  cmsCommunityId?: string;
  cmsApiKey?: string;
  cmsApiUrl?: string;
  cmsDefaultServerId?: number;
  radioCommunityId?: string;
  radioApiKey?: string;
  radioApiUrl?: string;
  debug?: boolean;
  apiHeaders?: HeadersInit ;
};
