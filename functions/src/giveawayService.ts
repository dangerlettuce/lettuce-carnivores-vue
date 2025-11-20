import admin from 'firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'
import { Filter } from 'firebase-admin/firestore'
import { onCall } from 'firebase-functions/v2/https';
import type { CallableRequest } from 'firebase-functions/v2/https'
import { getNextSequentialId } from './common'
import { FunctionResponse } from './types/Functions'

const collectionName = 'giveawayEntries' as const
interface GiveawayEntry extends CallableRequest {
    data: {
        giveawayName: string,
        uid: string,
        id?: number,
        displayName: string,
        email: string,
        instagram: string | null,
        facebook: string | null,
        preferredContactMethod: string,
        timestamp: Timestamp,
        bypassGame: boolean,
    }
}

export default onCall({}, async(request: GiveawayEntry): Promise<FunctionResponse> => {
    const uid = request.auth?.uid
    const isDataValid = checkIsDataValid(request.data) 
    const isUniqueEntry = await checkIsUniqueEntry(request)
    if(!uid || !request.auth || !isDataValid || !isUniqueEntry) {
        console.error({message: 'Error submitting giveaway entry', data: request})
        if(!isDataValid) {
            return {success: false, error: true, message: `Error submitting giveaway entry\nEmail may be invalid`, errorDetails: {isDataValid: isDataValid, isUniqueEntry: isUniqueEntry}, data: request.data}
        }
        if(!isUniqueEntry) {
            return {success: false, error: true, message: `Error submitting giveaway entry\nThis entry appears to be a duplicate`, errorDetails: {isDataValid: isDataValid, isUniqueEntry: isUniqueEntry}, data: request.data}
        }
        return {success: false, error: true, message: 'Error submitting giveaway entry', errorDetails: {isDataValid: isDataValid, isUniqueEntry: isUniqueEntry}, data: request.data}
    }
    request.data.id = await getNextSequentialId(collectionName)
    request.data.timestamp = admin.firestore.Timestamp.now()
    if(typeof request.data.id !== 'number') {
        return {success: false, error: true, message: 'Error saving entry', errorDetails: 'Unable to get next ID', data: null}
    }
    try {
        await admin.firestore().collection(collectionName).doc(request.data.id.toString()).set({...request.data})
        return {success: true, error: false, message: `Success! Entry ID ${request.data.giveawayName}-${request.data.id}`, errorDetails: null, data: null} 
    } catch (e: any) {
        console.error({message: 'Error saving giveaway entry', data: request})
        return {success: false, error: true, message: 'Error saving entry', errorDetails: e.toString(), data: null}
    }
})

async function checkIsUniqueEntry(request: GiveawayEntry) {
    if(!request.auth?.uid) {
        return false
    }
    try {
        const query = admin.firestore().collection(collectionName)
            .where(Filter.and(
                Filter.where('giveawayName', '==', request.data.giveawayName),
                Filter.or(
                    Filter.where('uid', '==', request.auth.uid), 
                    Filter.where('email', '==', request.data.email)
                )
            ))
        
        const snap = await query.get()
        if(snap.docs.length === 0) { 
            return true 
        } else {
            return false
        }
    } catch (e: any) {
        return false
    }
}

function checkIsDataValid(data: GiveawayEntry['data']) {
    return !isStringEmpty(data.uid) || !isStringEmpty(data.email)
}

function isStringEmpty(value: string) {
    return value === undefined || value === null || value === "";
}