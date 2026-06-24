import type { HttpsCallable } from 'firebase/functions';
// import type { FunctionResponse } from './Functions'
export interface EbayAccessTokenRequest extends HttpsCallable {
  data: {
    environment: EbayEnvironment;
    authCode?: string;
  };
}

export interface EbayDataRequest extends HttpsCallable {
  data: {
    environment: EbayEnvironment;
  };
}

export type EbayInventoryRequest = EbayDataRequest & {
  data: {
    sku?: string;
  };
};

export type EbayListingRequest = EbayDataRequest & {
  data: {
    granularityLevel?: GranularityLevel;
    daysAgo?: number;
  };
};
export interface EbayAccessTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export type AccessTokenDBResponse = {
  access_token: string;
  refresh_token: string;
  environment: EbayEnvironment;
  expires_in: number;
  token_type: string;
  updatedDateTime: string;
  updatedTimestamp: number;
  clientId: string;
  clientSecret: string;
};

// export interface UserAccessTokenResponse extends EbayAccessTokenFunctionResponse {
//     refresh_token: string,
//     refresh_token_expires_in: number,
// }

// export interface EbayAccessTokenFunctionResponse extends FunctionResponse {
//     data: EbayAccessTokenResponse
// }

export type EbayEnvironment = 'SANDBOX' | 'PRODUCTION';

export type GranularityLevel = 'Coarse' | 'Medium' | 'Fine';

export type PackageWeightAndSize = {
  dimensions: BoxDimensions;
  // packageType: 'MAILING_BOX', //seems like this should be there, but getting error when publishing offer
  weight: {
    value: number;
    unit: 'POUND' | 'OUNCE';
  };
};

export type BoxDimensions = {
  height: number;
  length: number;
  width: number;
  unit: 'INCH' | 'FEET';
};
