import type { Timestamp } from 'firebase/firestore'
import type { Plant, PlantCategory, PotSize } from '@/types/Plant'
import type { PhotoItem } from '@/types/Product'

export type StandardBoxSizes = '7x5x5' | '10x5x5' | '10x8x6' | '10x10x5' | '14x6x6'
export type ShoppingCart = {
  cartItems: CartItem[]
}

export type CartItem = Pick<Plant, 'id' | 'sku' | 'size' | 'isRepresentative' | 'shelfLocation' | 'dateListedForSale' | 'price'> &
  Pick<PlantCategory, 'name' | 'clone'> & {
    plantCategoryId: PlantCategory['id']
    categoryId: PlantCategory['id']
    quantity: number
    maxQuantity: number
    photo: PhotoItem,
    priceAfterDiscount?: number,
    excludeFromDiscounts?: boolean,
}

//New, more generic, cart item to work with Product.ts
export type NewCartItem = {
  sku: string,
  productCategoryId: string,
  name: string,
  price: number,
  quantity: number,
  maxQuantity: number,
  photo: PhotoItem,
  size?: string,
  priceAfterDiscount?: number,

}
//export type StripeCartItem = StripeProduct & {quantity: number}

export type StripeProduct = {
  active: boolean
  description: string
  images: string[]
  metadata: { sku: string | number }
  name: string
  role: null
  stripe_metadata_sku: string | number
  tax_code: string
  price: StripePrice
  shippable?: boolean
  id?: string
}

export type StripePrice = {
  active: boolean
  billing_scheme: string
  currency: 'usd'
  description: string | null
  interval: string | null
  interval_count: null
  metadata: {}
  product: string
  recurring: null
  tax_behavior: string
  tiers: null
  tiers_mode: null
  transform_quantity: null
  trial_period_days: null
  type: string
  unit_amount: number
  id: string
}

export type StripeCartItem = {
  priceId: string
  quantity: number
}

export type Order = {
  id: number
  cartTotal: {
    amountTotal: number
    amount_shipping: number
    amount_discount: number
    amount_tax: number
  }
  checkoutSessionId: string
  customer: string
  lineItems: {
    quantity: number
    price_data: {
      unit_amount: number
      product_data: {
        description: string
        name: string
        metadata: {
          categoryId: number
          sku: string
          clone: string
          size: string
          isRepresentative: boolean
          shelfLocation: string
          dateListedForSale?: Date
        }
      }
    }
  }[]
  orderDate: Timestamp
  orderStatus: {
    carrier: 'UPS' | 'USPS' | 'FedEx' | 'LocalPickup'
    status: 'Processing' | 'Shipped' | 'Shipping Scheduled' | 'Complete'
    trackingNumber: string
  }
  shippingInfo: {
    address: {
      line1: string
      line2: string | null
      city: string
      state: string
      postal_code: string
    }
    name: string
    email: string
    shippingType: 'Standard' | 'Expedited'
  }
  fullResponse: any
}

export type DiscountableItem = {
  quantity: number,
  id: string,
  sku: string,
  price: number,
  unit_amount?: number,
  priceAfterDiscount?: number
}
export interface Discount {
  id: string
  amount_off: number
  percent_off: number
  valid: boolean
  validThrough: Timestamp
  duration: string
  message: string
  type: 'multiplePlants' | 'buyGet' | 'siteWide'
}

export interface MultiPlantDiscount extends Discount {
  type: 'multiplePlants'
  parameters: {
    minimumQuantity: number
  }
}

export interface BuyGetDiscount extends Discount {
  type: 'buyGet'
  parameters: {
    buyX: number
    getY: number
  }
}

export interface SiteWideDiscount extends Discount {
  type: 'siteWide'
}

export type InventoryRecord = {
  active?: boolean
  listingId?: string
  offerId?: string
  plantCategoryId?: number
  updatedDateTime: string
  updatedTimestamp: number
  id: string
  status?: string
  error?: string
}


