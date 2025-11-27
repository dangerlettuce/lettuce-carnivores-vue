import admin from 'firebase-admin'
import type { GranularityLevel } from '../types/Ebay'
import axios, { AxiosResponse } from 'axios'
import { apiUrl, sandboxApiUrl  } from './ebayConstants'
import type { EbayEnvironment} from '../types/Ebay'
import xml2js from 'xml2js'
import { getUpdateDateTime } from '../common'
import { getAccessToken } from './ebayService'
import { error, log } from 'firebase-functions/logger'


export async function getInventoryItems(environment: EbayEnvironment, token: string, sku?: string) {
    const baseUrl = environment === 'SANDBOX' ? sandboxApiUrl: apiUrl
    let url = `${baseUrl}/sell/inventory/v1/inventory_item`
    if(sku && sku.length > 0 && sku !== undefined) {
        url = `${url}/${sku}`
    }

    const config = {
        headers: {
            'Authorization':`Bearer ${token}`,
            'Accept': 'application/json',
        }
    }
    const res = await axios.get(url, config)
    return res.data
}

export async function createOrReplaceInventoryItem(token: string, sku: string, item: any, plantCategoryId: string) {
    const data = item;
    data.product.title = shortenLongTitle(data.product.title);
    const config = {
        method: 'put',
        url: `${apiUrl}/sell/inventory/v1/inventory_item/${sku}`,
        headers: {
            'Authorization':`Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Language': 'en-US'
        },
        data
    }

    const res = await axios(config).catch((e: any) => {console.error(e); return e})
    if( res && 'status' in res && res.status === 204) {
        admin.firestore().collection('inventory').doc(sku).set({...getUpdateDateTime(), plantCategoryId, sku}, {merge: true})
        return {success: true}
    }
    if(res && 'response' in res && 'data' in res.response) {
        return res.response.data
    }
    if(res && 'response' in res) {
        return res.response
    }
    return res
}

function shortenLongTitle(title: string): string {
    let newTitle = title;
    newTitle = newTitle.replace('semi-round', 'pot');
    if (newTitle.length > 80) {
        newTitle = newTitle.substring(0, 77) + '...';
        console.warn(`Title ${title} exceeded 80 characters and was truncated.`);
    }
    return newTitle;
}

export async function postEbayOffer(token: string, data: any, environment?: EbayEnvironment, offerId?: string) {
    const baseUrl = environment === 'SANDBOX' ? sandboxApiUrl : apiUrl
    const config = {
        method: 'post',
        url: `${baseUrl}/sell/inventory/v1/offer`,
        headers: {
            'Authorization':`Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Language': 'en-US'
        },
        data: data
    }
    if(offerId && offerId.length > 0) {
        config.url = `${config.url}/${offerId}`
    }

    const res = await axios(config).catch((e: any) => {console.error(e); return e})

    if( res && 'status' in res && res.status === 201 || res.status === 200 || res.status === 204) {
        admin.firestore().collection('inventory').doc(data.sku).set({offerId: res.data.offerId, ...getUpdateDateTime()}, {merge: true})
        return {success: true, data: res.data}
    }
    log(`Errors from eBay ${res.status} response:`)
    if(res.response.data && 'errors' in res.response.data) {
        res.response.data.errors.forEach((error: any) => log(error))
    }
    if(res.data && 'errors' in res.data) {
        res.data.errors.forEach((error: any) => log(error))
    }
    return {success: false, message: 'Unexpected response. Expected 201 with res.data.offerId value'}
}

export async function publishOffer(token: string, offerId: string, environment?: EbayEnvironment) {
    if(!offerId) {
        error('No offer ID')
        return {success: false, message: 'No offer ID'}
    }
    const baseUrl = environment === 'SANDBOX' ? sandboxApiUrl : apiUrl
    const config = {
        method: 'post',
        url: `${baseUrl}/sell/inventory/v1/offer/${offerId}/publish`,
        headers: {
            'Authorization':`Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Language': 'en-US'
        }
    }
    const res = await axios(config).catch((e: any) => {
        error(e.response.data.errors)
        return {success: false, message: e.data.errors[0]}
    })

    if( res && 'status' in res && res.status === 200) {
        return {success: true, data: res.data}
    }

    return {success: false, message: 'Unexpected response. Expected 200 with res.data.listingId value'}

}

export async function deleteEbayInventoryItem(sku: string) {
    const {access_token} = (await getAccessToken()).data
    if(!access_token || access_token.length < 20) {
        return {success: false, message: 'Unable to get access token'}
    }
    const url = `${apiUrl}/sell/inventory/v1/inventory_item/${sku}`
    const config = {
        headers: {
            'Authorization':`Bearer ${access_token}`,
        }
    }
    const res = await axios.delete(url, config).catch((e) => {error(e)})
    if(!res || !res?.status) { return {success: false}}
    if(res.status === 204) {
        return {success: true}
    }
    if(res.status === 404) {
        return {success: false, message: `SKU ${sku} not found`}
    }
    error(res)
    return {success: false, message: 'Something went wrong'}
}


export async function getListingsData(environment: EbayEnvironment, token: string, granularityLevel: GranularityLevel = 'Medium', daysAgo: number = 120) {
    if(daysAgo > 121) { return {error: true, success: false, message: 'Cannot query more than 121 days'}}
    const baseUrl = environment === 'PRODUCTION' ? apiUrl : sandboxApiUrl
    const now = new Date()
    const startDate = new Date(new Date().setDate(now.getDate() - daysAgo));

    const granularity = granularityLevel
    const xmlBody = `<?xml version="1.0" encoding="utf-8"?>
        <GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
            <ErrorLanguage>en_US</ErrorLanguage>
            <WarningLevel>High</WarningLevel>
            <!--You can use DetailLevel or GranularityLevel in a request, but not both-->
        <GranularityLevel>${granularity}</GranularityLevel>
            <!-- Enter a valid Time range to get the Items listed using this format
                2013-03-21T06:38:48.420Z -->
        <StartTimeFrom>${startDate.toISOString()}</StartTimeFrom>
        <StartTimeTo>${now.toISOString()}</StartTimeTo>
        <IncludeWatchCount>true</IncludeWatchCount>
        <Pagination>
            <EntriesPerPage>200</EntriesPerPage>
        </Pagination>
        </GetSellerListRequest>`
    const config = {
        headers: {
            'Content-Type': 'text/xml',
            'X-EBAY-API-SITEID' :'0',
            'X-EBAY-API-COMPATIBILITY-LEVEL' :'967',
            'X-EBAY-API-CALL-NAME' :'GetSellerList',
            'X-EBAY-API-IAF-TOKEN' : token
        },
    }
    const res = await axios.post(`${baseUrl}/ws/api.dll`, xmlBody, config).catch(e => {return e})
    if(res.status === 200) {
        const parsedResponse = await parseXmlResponse(res)
        return JSON.stringify(parsedResponse)
    }
    return res
}

async function parseXmlResponse(response: AxiosResponse) {
    let parsedData
    const parser = new xml2js.Parser()
    await parser.parseStringPromise(response.data).then((result) => {
        parsedData = result
    }).catch((err) => {
        console.error('Error parsing XML:', err)
        parsedData = undefined
    })
    return parsedData
}
