import admin from 'firebase-admin'
import { getAllDocs } from '../common'
import { BuyGetDiscount, CartItem, Discount, MultiPlantDiscount, SiteWideDiscount, DiscountableItem } from '../types/Orders'
import { calculateBuyGetDiscounts, calculateDiscounts } from './useDiscountCalculator'


export async function handleDiscounts(cart: CartItem[]) {
  const cartItemWithId = cart.map((item) => ({ ...item, id: item.sku }))
  const activeDiscounts = await getActiveDiscounts()
  const bestDiscount = calculateDiscounts (cartItemWithId, activeDiscounts)
  return await applyItemDiscounts(cartItemWithId, activeDiscounts)
}


export async function getActiveDiscounts() {
  const discountDocs = await getAllDocs<MultiPlantDiscount | BuyGetDiscount | SiteWideDiscount>('discounts')
  if (!discountDocs || discountDocs.length === 0) {
    return []
  }
  return discountDocs.filter(
    (item) => item.valid && item.validThrough.toMillis() >= admin.firestore.Timestamp.now().toMillis(),
  )
}


export async function applyItemDiscounts(cart: DiscountableItem[], discounts: Discount[]) {
  if (cart.length === 0 || discounts.length === 0) { 
    return { cart, stripeCoupons: [], totalCartDiscountedAmount: 0 }
  }
  const cartQuantity = cart.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0)
  const stripeCoupons: { coupon: string }[] = []
  let totalCartDiscountedAmount = 0
  let isBuyGetApplied = false
  discounts.forEach((discount) => {
    if (discount.type === 'buyGet') {
      const buyGetDiscount = calculateBuyGetDiscounts(cart, discount as BuyGetDiscount)
      if (buyGetDiscount?.isQualified) {
        buyGetDiscount.discountedItems.forEach((discountedItem) => {
          const index = cart.findIndex(item => item.sku === discountedItem.sku)
          if (cart[index].quantity === 1) {
            const price = cart[index].price ?? 0
            const discountedPrice = price * (100 - discount.percent_off)
            cart[index].price = discountedPrice
            totalCartDiscountedAmount += price - discountedPrice
          } else {
            const newCartItem = { ...cart[index] }
            newCartItem.quantity = 1
            newCartItem.price = cart[index].price * (100 - discount.percent_off)
            newCartItem.sku = cart[index].sku + '-2'
            cart[index].quantity--
            
            cart.push(newCartItem)
          }
          isBuyGetApplied = true
        })
      }
    }

    if (discount.type === 'multiplePlants' && isBuyGetApplied === false) {
      if (cartQuantity >= (discount as MultiPlantDiscount).parameters.minimumQuantity) {
        stripeCoupons.push({ coupon: discount.id })
        totalCartDiscountedAmount += Math.round(((cartTotal * discount.percent_off) / 100) * 100) / 100
       } 
    }
    
    if (discount.type === 'siteWide' && isBuyGetApplied === false) {
      stripeCoupons.push({ coupon: discount.id })
      totalCartDiscountedAmount += Math.round(((cartTotal * discount.percent_off) / 100) * 100) / 100
    }
  })
  return { cart, stripeCoupons, totalCartDiscountedAmount }
}
