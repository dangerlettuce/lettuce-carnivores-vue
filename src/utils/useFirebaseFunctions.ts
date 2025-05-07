import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import type { AppData, AppError, AppResponse } from '@/types/App'
import type { HttpsCallableResult } from 'firebase/functions'

let emulateFunctions = true
export function getFirebaseFunction(functionName: string) {
  const functions = getFunctions()
  if (emulateFunctions === true) {
    console.log('Using Firebase function emulator')
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  }
  try {
    return { success: true, res: httpsCallable(functions, functionName) }
  } catch (e: any) {
    if (import.meta.env.MODE !== 'PRODUCTION' && import.meta.env.VITE_EMULATE_FIREBASE_FUNCTIONS === 'true') {
      return { success: false, message: 'Unable to get FIrebase functions, may need to start emulator' }
    }
    return { success: false, message: 'Unable to get Firebase functions' }
  }
}

export async function executeFunction<T>(
  functionName: string,
  params: any,
): Promise<AppData<HttpsCallableResult<T | AppError>> | AppError> {
  let firebaseFunction
  try {
    const res = getFirebaseFunction(functionName)
    firebaseFunction = res.res
  } catch (e: any) {
    console.error('Unable to get FB function')
    return { success: false, message: `Unable to get FB Function ${functionName}`, errorDetails: e }
  }
  if (firebaseFunction === undefined) {
    return { success: false, message: `Unable to get FB Function ${functionName}` }
  }
  try {
    const res = (await firebaseFunction(params)) as HttpsCallableResult<T>
    return { success: true, data: unwrapResponse(res) }
  } catch (e: any) {
    console.error(e)
    return { success: false, message: `Error calling FB Function ${functionName}`, errorDetails: e }
  }
}

export function isSuccess<T, E>(res: AppResponse<T> | AppError): res is AppResponse<T> {
  return res.success === true
}

export function unwrapResponse(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  if ('data' in obj) {
    return unwrapResponse(obj.data)
  }
  if ('res' in obj) {
    return unwrapResponse(obj.res)
  }
  return obj
}
