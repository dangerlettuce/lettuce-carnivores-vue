import admin from 'firebase-admin'
import { onCall, type CallableRequest } from 'firebase-functions/v2/https'

import {
  discountedShippingThreshold,
  discountedStandardShippingId,
  discountedExpeditedShippingId,
  standardShippingId,
  expeditedShippingId,
  isColdWeatherShippingActive,
  coldWeatherShippingId,
  discountedColdWeatherShippingId,
  mossShippingCategoryId,
  mossShippingId,

} from './constants/stripeConstants'
import Stripe from 'stripe'
import type { Plant, PlantCategory } from './types/Plants'
import { FunctionResponse } from './types/Functions'
import { CartItem } from './types/Orders'
import { type CustomerRecord } from './types/Users'
import { StripeLineItem } from './types/Stripe'
import { handleDiscounts } from './stripe/stripeService'

interface CheckoutSessionRequest extends CallableRequest {
  data: {
    cart: CartItem[]
    returnUrl: string
    cancelUrl: string
    stripeCustomer: CustomerRecord | undefined
  }
}

export default onCall(async (request: CheckoutSessionRequest): Promise<FunctionResponse> => {
  const stripeSecretKey = process.env.STRIPE_RESTRICTED_KEY
  if (!stripeSecretKey || stripeSecretKey.length === 0) {
    return { success: false, error: true, message: 'Unable to get stripe API key', errorDetails: null, data: null }
  }
  const stripe = new Stripe(stripeSecretKey)
  const uid = request.auth?.uid
  if (!uid || !request.auth || request.data.cart.length === 0) {
    return { success: false, error: true, message: 'Unable to create checkout session', errorDetails: null, data: null }
  }

  const checkoutSession = await buildCheckoutSession(
    request.data.cart,
    uid,
    request.data.returnUrl,
    request.data.cancelUrl,
    request.data.stripeCustomer,
  )
  
  if (checkoutSession === null) {
    return { success: false, error: true, message: 'Error creating checkout session', errorDetails: null, data: null }
  }

  const stripeCheckoutSession = await stripe.checkout.sessions.create(checkoutSession)
  await admin.firestore().collection(`customers/${uid}/checkout_sessions`).doc().set(stripeCheckoutSession)

  await admin
    .firestore()
    .collection(`checkoutSessions`)
    .doc(stripeCheckoutSession.id)
    .set({ sessionResponse: stripeCheckoutSession, lineItems: checkoutSession.line_items })
  return { success: true, error: false, message: 'Success', errorDetails: null, data: stripeCheckoutSession }
})

async function buildCheckoutSession(
  cartItems: CartItem[],
  uid: string,
  returnUrl: string,
  cancelUrl: string,
  stripeCustomer: CustomerRecord | undefined,
) {
  const stripeCart = await buildStripeCart(cartItems)
  if (!stripeCart || !stripeCart.data) {
    return null
  }
  const discountData = await handleDiscounts(stripeCart.data as unknown as CartItem[])
  const lineItems: StripeLineItem[] = (discountData.cart as unknown as CartItem[]).map((item: CartItem) => {
    let description = `SKU: ${item.sku} Size: ${item.size}`
    if (item.clone) {
      description += ` Clone: ${item.clone}`
    }
    return {
      price_data: {
        currency: 'usd',
        unit_amount: item.price,
        product_data: {
          name: item.name,
          description,
          metadata: {
            sku: item.sku,
            categoryId: item.categoryId,
            clone: item.clone,
            size: item.size,
            isRepresentative: item.isRepresentative,
            shelfLocation: item.shelfLocation ?? '',
          },
          tax_code: 'txcd_99999999',
        },
      },
      quantity: item.quantity,
    }
  })

  const cartTotal = (stripeCart.data as CartItem[]).reduce((accumulator, cartItem) => accumulator + cartItem.price * cartItem.quantity, 0)

  const session: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    client_reference_id: uid,
    tax_id_collection: { enabled: true },
    success_url: returnUrl, //not allowed when we switch to embedded
    // return_url: returnUrl,
    cancel_url: cancelUrl,
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    automatic_tax: { enabled: true },
    discounts: [],
    locale: 'auto',
    ui_mode: 'hosted',
    line_items: lineItems,
  }
  if (stripeCustomer && stripeCustomer.stripeId !== '') {
    (session.customer = stripeCustomer.stripeId),
      (session.customer_update = {
        shipping: 'auto',
        address: 'auto',
        name: 'auto',
      })
  }
  if (discountData.stripeCoupons.length > 0) {
    session.discounts = discountData.stripeCoupons
  }
  const isQualifiedForDiscountedShipping = cartTotal - discountData.totalCartDiscountedAmount >= discountedShippingThreshold
  session.shipping_options = createShippingOptions({isQualifiedForDiscountedShipping, cartItems: stripeCart.data as CartItem[]})
  return session
}

async function buildStripeCart(cartItems: CartItem[]): Promise<FunctionResponse> {
  if (cartItems.length === 0) {
    return { success: false, error: true, message: 'Cart is empty', errorDetails: null, data: cartItems }
  }
  const stripeCart = cartItems
  const plantDetails = await getPlantDetailsFromFirestore({ collection: 'plantCategories', items: stripeCart })
  if (plantDetails === null || plantDetails.length === 0) {
    return { success: false, error: true, message: 'Unable to get product data', errorDetails: null, data: stripeCart }
  }
  for (const item of stripeCart) {
    const plant = plantDetails.find((plant) => item.sku === plant.sku)
    if (!plant) {
      return { success: false, error: true, message: 'Unable to get product data', errorDetails: null, data: stripeCart }
    }
    if (item.quantity > plant.quantity) {
      return { success: false, error: true, message: 'Quantity exceeds available inventory', errorDetails: null, data: stripeCart }
    }
    item.price = plant.price * 100
  }
  return { success: true, error: false, message: 'Success', errorDetails: null, data: stripeCart }
}

type PlantDetailsFromFirestoreRequest = {
  collection: string
  items: CartItem[] | { categoryId: string }[]
}

async function getPlantDetailsFromFirestore(request: PlantDetailsFromFirestoreRequest): Promise<Plant[]> {
  const collection = request.collection
  let plants: Plant[] = []
  for (const category of request.items) {
    const docRef = admin.firestore().doc(`${collection}/${category.categoryId}`)
    const snap = await docRef.get().catch((e: any) => console.error(e))
    if (snap && snap.data()) {
      const data = snap.data() as PlantCategory
      plants = plants.concat(data.plants)
    }
  }
  return plants
}

function createShippingOptions(data: { isQualifiedForDiscountedShipping: boolean, cartItems: CartItem[] }) {
  if (isColdWeatherShippingActive) {
    return [{ shipping_rate: data.isQualifiedForDiscountedShipping ? discountedColdWeatherShippingId : coldWeatherShippingId }]
  }
  if (data.cartItems.length === 1 && data.cartItems[0].categoryId.toString() == mossShippingCategoryId.toString()) {
    return [{ shipping_rate: mossShippingId }]
  } 
 
  return data.isQualifiedForDiscountedShipping ?
    [{ shipping_rate: discountedStandardShippingId }, { shipping_rate: discountedExpeditedShippingId }] :
    [{ shipping_rate: standardShippingId }, { shipping_rate: expeditedShippingId }]
}