import { collection, getDocs, query, where} from 'firebase/firestore';
import { db } from '@/apis/firebase'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'

import { type CartItem } from '@/types/Orders';
import { findDocById } from './dataServices'
import { useUserStore } from '@/stores/users'
import { executeFunction } from '@/utils/useFirebaseFunctions';

export async function getActiveProducts() {
    const q = query(collection(db, 'products'),
        where('active', '==', true)
    )

    const querySnapshot = await getDocs(q)
    if(querySnapshot.docs.length === 0) {
        throw new Error ('No products found')
    }
    let docs: any = []
    querySnapshot.forEach(async (doc) => {
        const priceSnap = await getDocs(collection(doc.ref,'prices'))
        priceSnap.docs.forEach((priceDoc) => {
        docs.push({...doc.data(), price: {...priceDoc.data(), id: priceDoc.id}})
        });
    })
    return docs
}


export async function createStripeCheckoutSession(cart: CartItem[]){
    const { user } = useUserStore()
    let stripeCustomer = undefined
    if(user && user.uid) {
        stripeCustomer = await findDocById('customers', user.uid)
    }
    const res = await executeFunction(
        'stripeCheckoutController', {
            cart: cart,
            returnUrl: `${window.location.origin}/checkoutComplete`,
            cancelUrl:`${window.location.origin}/cart`,
            stripeCustomer: stripeCustomer,
        }).catch((e: any) => {console.error(e); return {
        success: false,
        error: true,
        errorDetails: e,
        message: 'Error when trying to create Stripe checkout session'}
    })
    return res
}
