import admin from 'firebase-admin';
import axios from 'axios';
import type { FunctionResponse } from '../types/Functions';
import type {
  EbayEnvironment,
  EbayAccessTokenFunctionResponse,
  EbayAccessTokenResponse,
  UserAccessTokenResponse,
  AccessTokenDBResponse,
  EbayItemNotification,
  EbayGetItemResponse,
  EbayItem,
} from '../types/Ebay';
import { authUrl, sandboxAuthUrl, apiUrl, sandboxApiUrl, RuNameProd, RuNameSandbox, prodScopes, sandboxScopes } from './ebayConstants';
import { getUpdateDateTime } from '../common';
import { debug, error } from 'firebase-functions/logger';

export async function submitAccessTokenRequest(
  environment: EbayEnvironment,
  clientId: string,
  clientSecret: string,
): Promise<EbayAccessTokenFunctionResponse | FunctionResponse> {
  const url = `${environment === 'PRODUCTION' ? authUrl : sandboxAuthUrl}/identity/v1/oauth2/token`;
  //const encodedScopes = encodeURIComponent(scopes)
  if (!clientId || !clientSecret) {
    return { success: false, error: true, message: 'Unable to get access token', errorDetails: null, data: null };
  }
  const authCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${authCredentials}`,
  };
  const body = {
    grant_type: 'client_credentials',
  };
  const res = await axios.post(url, body, { headers: headers }).catch((e) => {
    error(e.response.data);
    return { success: false, error: true, message: 'Unable to get access token', errorDetails: e.response.data, data: null };
  });
  return { success: true, error: false, message: 'Success', data: res.data as unknown as EbayAccessTokenResponse, errorDetails: null };
}

export function generateUserConsentUrl(environment: EbayEnvironment, clientId: string, state?: string) {
  const url = `${environment === 'PRODUCTION' ? authUrl : sandboxAuthUrl}/oauth2/authorize`;
  const RuName = environment === 'PRODUCTION' ? RuNameProd : RuNameSandbox;
  const scopes = encodeURIComponent(environment === 'PRODUCTION' ? prodScopes : sandboxScopes);
  const userConsentParams: { [key: string]: string } = {
    client_id: clientId,
    redirect_uri: RuName,
    response_type: 'code',
    scope: scopes,
  };
  if (state) {
    userConsentParams['state'] = state;
  }
  if (!clientId) {
    return undefined;
  }
  const params = new URLSearchParams(userConsentParams);
  const ebayLoginUrl = `${url}?${params}`;
  return ebayLoginUrl;
}

export async function updateUserAccessToken(
  clientId: string,
  clientSecret: string,
  authCode: string | undefined,
  environment: EbayEnvironment = 'PRODUCTION',
): Promise<UserAccessTokenResponse | FunctionResponse> {
  const url = `${environment === 'PRODUCTION' ? apiUrl : sandboxApiUrl}/identity/v1/oauth2/token`;
  const RuName = environment === 'PRODUCTION' ? RuNameProd : RuNameSandbox;
  if (!clientId || !clientSecret) {
    return { success: false, message: 'Unable to get access token' };
  }
  if (!authCode) {
    return { success: false, message: 'Missing auth code' };
  }

  const authCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${authCredentials}`,
  };
  let body;
  if (authCode !== undefined) {
    body = {
      grant_type: 'authorization_code',
      redirect_uri: RuName,
      code: decodeURI(authCode),
    };
  }
  const res = await axios.post(url, body, { headers: headers }).catch((e) => {
    error(e);
    return { success: false, error: true, message: 'Unable to get access token', errorDetails: e, data: null };
  });
  if (!res || !res.data) {
    let messageText = '';
    if ('message' in res) {
      messageText = res.message;
    }
    let errorDetails = {};
    if ('errorDetails' in res) {
      errorDetails = res.errorDetails;
    }
    return { success: false, error: true, message: messageText, errorDetails: errorDetails, data: null };
  }
  const updatedDateTime = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const newTokenData = { ...res.data, updatedTimestamp: Math.floor(Date.now() / 1000), updatedDateTime, environment };
  const tokenDoc = environment === 'PRODUCTION' ? 'ebayToken' : 'sandboxToken';
  await admin.firestore().collection('admin').doc(tokenDoc).update(newTokenData);
  return { success: true, data: newTokenData as unknown as UserAccessTokenResponse };
}

export async function getAccessToken(clientId?: string, clientSecret?: string) {
  const oldTokenData = await getTokenFromDb();
  if (oldTokenData.isValid) {
    return { success: true, data: oldTokenData.data };
  }
  const headers = buildAuthHeaders(clientId ?? oldTokenData.data?.clientId, clientSecret ?? oldTokenData.data?.clientSecret);
  if (!headers || !oldTokenData.data?.refresh_token) {
    return { success: false, message: 'Unable to build request' };
  }
  const config = {
    url: `${apiUrl}/identity/v1/oauth2/token`,
    method: 'post',
    headers: headers,
    data: {
      grant_type: 'refresh_token',
      refresh_token: oldTokenData.data.refresh_token,
    },
  };

  const res = await axios(config).catch((e) => {
    error(e);
    return { success: false, message: 'Unable to get access token', errorDetails: e };
  });
  if (res && 'data' in res) {
    return { success: true, data: await updateTokenInDb(res.data) };
  }
  return { success: false, message: 'Something went wrong with API call' };
}

export async function getTokenFromDb() {
  const data = await getTokenData();
  if (!data) {
    return { isValid: false, data };
  }
  const now = Math.floor(Date.now() / 1000);
  const isValid = data.updatedTimestamp + 115 * 60 > now && data.access_token !== '';
  return { isValid, data };
}

export async function getTokenData(): Promise<AccessTokenDBResponse | undefined> {
  const tokenDoc = 'ebayToken';
  const tokenResponse = await admin
    .firestore()
    .collection('admin')
    .doc(tokenDoc)
    .get()
    .catch((e) => {
      console.log(e);
      return undefined;
    });
  const data = tokenResponse?.data();
  if (data && 'access_token' in data) {
    return data as unknown as AccessTokenDBResponse;
  }
  return undefined;
}

function buildAuthHeaders(clientId: string | undefined, clientSecret: string | undefined) {
  if (!clientId || !clientSecret) {
    return null;
  }
  const authCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Basic ${authCredentials}`,
  };
}

async function getAuthCodeFromDb() {
  const snap = await admin.firestore().collection('admin').doc('ebayToken').get();
  if (!snap || snap === undefined || snap.data() === undefined) {
    return { success: false, error: true, message: 'Unable to get refresh token from db', errorDetails: {}, data: {} };
  }
  return snap.data()?.authCode;
}

async function updateTokenInDb(data: any) {
  const updateDateTime = getUpdateDateTime();
  const newTokenData = { ...data, ...updateDateTime };
  await admin.firestore().collection('admin').doc('ebayToken').update(newTokenData);
  return newTokenData;
}

async function validateEbayNotification(data: any) {}

export function getSkuFromEbayResponse(data: EbayItemNotification) {
  let sku: string | undefined;
  try {
    if ('GetItemResponse' in data.Body && data.Body.GetItemResponse) {
      sku = data.Body.GetItemResponse.Item.SKU.toString();
    }
    if ('GetItemTransactionsResponse' in data.Body && data.Body.GetItemTransactionsResponse) {
      sku = data.Body.GetItemTransactionsResponse.Item.SKU.toString();
    }
  } catch (e) {
    error('Unable to get SKU in getSkuFromEbayResponse');
    debug(data.Body);
  }
  return sku;
}

export function getFieldFromEbayItemResponse(data: EbayItemNotification, fieldName: keyof EbayItem) {
  let field: string | undefined;
  try {
    if ('GetItemResponse' in data.Body && data.Body.GetItemResponse && fieldName in data.Body.GetItemResponse.Item) {
      field = data.Body.GetItemResponse.Item[fieldName].toString();
    }
    if (
      'GetItemTransactionsResponse' in data.Body &&
      data.Body.GetItemTransactionsResponse &&
      fieldName in data.Body.GetItemTransactionsResponse.Item
    ) {
      field = data.Body.GetItemTransactionsResponse.Item[fieldName].toString();
    }
  } catch (e) {
    error(`Unable to get field ${fieldName} from getFieldFromEbayItemResponse`);
    debug(data.Body);
  }
  return field;
}

export function getEventTypeFromEbayResponse(data: EbayItemNotification) {
  let eventType: string | undefined;
  try {
    if ('GetItemResponse' in data.Body && data.Body.GetItemResponse) {
      eventType = data.Body.GetItemResponse.NotificationEventName;
    }
    if ('GetItemTransactionsResponse' in data.Body && data.Body.GetItemTransactionsResponse) {
      eventType = data.Body.GetItemTransactionsResponse.NotificationEventName;
    }
  } catch (e) {
    error('Unable to get Event Type in getEventTypeFromEbayResponse');
    debug(data.Body);
  }
  return eventType;
}
