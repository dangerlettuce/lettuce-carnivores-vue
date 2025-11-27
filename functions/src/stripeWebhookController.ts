import admin from 'firebase-admin'
import { error, log } from 'firebase-functions/logger'
import { onRequest } from 'firebase-functions/v2/https'
import { StripeLineItem } from './types/Stripe'
import Stripe from 'stripe'
import { discountedStandardShippingId, standardShippingId, coldWeatherShippingId, discountedColdWeatherShippingId, expeditedShippingId, discountedExpeditedShippingId } from './constants/stripeConstants'
import { getNextSequentialId } from './common'
import { updateInventoryFromStripeSale } from './inventory/inventoryService'
import { Filter } from 'firebase-admin/firestore'

export default onRequest(async (req, res): Promise<any> => {
  log('Received stripe webhook request')
  const stripeSecretKey = process.env.STRIPE_RESTRICTED_KEY
  const stripeWebhookSecretKey = process.env.STRIPE_WEBHOOK_SECRET_KEY
  if (!stripeSecretKey || !stripeWebhookSecretKey || stripeWebhookSecretKey.length === 0) {
    return res.status(400).send('Unable to get stripe secret key')
  }
  const stripe = new Stripe(stripeSecretKey)
  if (!req || !req.headers || !req.headers['stripe-signature']) {
    error('Request missing stripe webhook headers')
    return res.status(400).send('Request missing stripe webhook headers')
  }
  let signature = req.headers['stripe-signature']
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, signature, stripeWebhookSecretKey)
  } catch (e: any) {
    error('Webhook signature failed')
    return res.status(400).send('Webhook signature failed')
  }
  log(`Received stripe webhook request ${event.type}`)
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    await fulfillCheckout(event.data.object)
    log(event.data.object)
  }
  res.status(200).send()
})

async function fulfillCheckout(data: Stripe.Checkout.Session) {
  if (await isDuplicateCall(data.id)) {
    error(`Duplicate call for checkout session ID ${data.id}`)
    return false
  }
  const checkoutSession = await admin.firestore().collection(`checkoutSessions`).doc(data.id).get()
  if (!checkoutSession || checkoutSession === undefined || checkoutSession.data() === undefined) {
    error(`Unable to get checkout session from Firestore DB for ID ${data.id}`)
    return false
  }
  const lineItems = checkoutSession.data()!.lineItems as StripeLineItem[]

  const shippingType = getShippingType(data.shipping_cost)

  const orderNumber = await getNextSequentialId('orders')
  if (typeof orderNumber !== 'number') {
    error(`Unable to get next order ID`)
    return false
  }
  const orderDetails = {
    id: orderNumber,
    customer: data.client_reference_id,
    orderDate: new Date(),
    checkoutSessionId: data.id,
    paymentStatus: data.payment_status,
    shippingInfo: {
      address: data.shipping_details?.address,
      name: data.shipping_details?.name,
      email: data.customer_details?.email,
      phone: data.customer_details?.phone,
      shippingType: shippingType,
    },
    orderStatus: {
      status: 'Processing',
      trackingNumber: '',
      carrier: '',
    },
    lineItems: lineItems,
    cartTotal: {
      amountTotal: data.amount_total,
      ...data.total_details,
    },
    fullResponse: data,
  }
  await admin
    .firestore()
    .collection(`orders`)
    .doc(orderNumber.toString())
    .set(orderDetails)
    .catch((e: any) => {
      log(e)
    })
  await admin
    .firestore()
    .collection(`customers/${data.client_reference_id}/orders`)
    .doc(orderNumber.toString())
    .set(orderDetails)
    .catch((e: any) => {
      log(e)
    })
  const soldNote = `Order ${orderNumber.toString()} -  Stripe ID ${data.id}`
  await updateInventoryFromStripeSale(lineItems, soldNote)
  return true
}

async function isDuplicateCall(id: string) {
  const query = admin
    .firestore()
    .collection('orders')
    .where(Filter.where('checkoutSessionId', '==', id))
  const snap = await query.get()
  return snap.docs.length !== 0
}

//@ts-ignore - stripe api seems to have changed, maybe types not working?
function getShippingType(shippingCost: Stripe.Checkout.Session['shipping_cost'] | string) {
  let shippingId = null;
  if (typeof shippingCost === 'string' && shippingCost.length > 20) {
    shippingId = shippingCost;
  }
  if (shippingCost && typeof shippingCost === 'object' && 'shipping_rate' in shippingCost) {
    shippingId = shippingCost.shipping_rate;
  }
  if (shippingId === null) {
    error(`Unable to parse shippingId from checkout data ${shippingCost}`)
  } 
  let shippingType = null;
  switch (shippingId) { 
    case coldWeatherShippingId:
    case discountedColdWeatherShippingId:
      shippingType = 'Cold Weather'
      break;
    case expeditedShippingId:
    case discountedExpeditedShippingId:
      shippingType = 'Expedited'
      break;
    case standardShippingId:
    case discountedStandardShippingId:
      shippingType = 'Standard'
      break;
    default:
      console.error(`Unknown shipping ID ${shippingId}`)
      shippingType = 'Unknown';
  }
  return shippingType;

}