import type { BuyGetDiscount, Discount, DiscountableItem, MultiPlantDiscount, SiteWideDiscount } from '../types/Orders'

export function calculateBuyGetDiscounts(cartItems: DiscountableItem[], discount: BuyGetDiscount) {
  if (discount.type !== 'buyGet' || !discount.percent_off || !discount.parameters.buyX || !discount.parameters.getY) {
    return null
  }
  const buyX = discount.parameters.buyX
  const getY = discount.parameters.getY
 
  const cartItemWithId = cartItems.map((item) => ({ ...item, id: item.sku }))
  const sortedItems = spreadArray<DiscountableItem>(cartItemWithId)
  if ('price' in sortedItems[0]) {
    sortedItems.sort((a, b) => b.price! - a.price!)
  }
  if ('unit_amount' in sortedItems[0]) {
    sortedItems.sort((a, b) => b.unit_amount! - a.unit_amount!)
  }
  let totalDiscount = 0
  const discountedItems: DiscountableItem[] = []
  let itemsBoughtCounter = 0
  let discountedItemCounter = 0
  let isQualified = false

  for (let item of sortedItems) {
    if (discountedItemCounter > 0) {
      discountedItemCounter--
      discountedItems.push(item)
      const itemPrice = item?.price ?? item?.unit_amount ?? 0
      totalDiscount += itemPrice * (discount.percent_off / 100)
      continue
    }
    itemsBoughtCounter++
    if (itemsBoughtCounter === buyX) {
      itemsBoughtCounter -= buyX
      discountedItemCounter += getY
      isQualified = true
    }
  }
  let message = ``
  if (itemsBoughtCounter !== 0) {
    const itemsToQuality = buyX - itemsBoughtCounter
    message = `Add ${itemsToQuality} more plant${itemsToQuality > 1 ? 's' : ''} to quality for`
    if (discount.percent_off === 100) {
      message = `${message} ${getY === 1 ? 'a' : getY} free plant${getY > 1 ? 's' : ''}`
    } else {
      message = `${message} ${getY}% off another plant`
    }
  }
  if (itemsBoughtCounter === 0 && discountedItemCounter === 0 && discountedItems.length > 0) {
    message = `Your order qualifies for ${discountedItems.length === 1 ? 'a' : discountedItems.length} free plant${discountedItems.length > 1 ? 's' : ''}! The discount has been applied to your cart.`
  }
  if (discountedItemCounter > 0 && itemsBoughtCounter === 0) {
    message = `Your order qualifies for ${discountedItemCounter === 1 ? 'a' : discountedItemCounter} free plant${discountedItemCounter > 1 ? 's' : ''}! The discount will automatically applied when you add another plant to your cart.`
  }

  return {
    discountedItems: combineArray(discountedItems),
    totalDiscount,
    message,
    isQualified
  }
}

export function calculateDiscounts(items: DiscountableItem[], discounts: Discount[]) {
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const cartTotal = items.reduce((acc, item) => acc + (item.price ?? item.unit_amount) * item.quantity, 0)
  let bestDiscount = null
  let bestDiscountMessage = null
  let bestDiscountAmountOff = 0
  let discountedItems: DiscountableItem[] = []
  if (!discounts || discounts.length === 0 || !items || items.length === 0) {
      return { bestDiscount, bestDiscountMessage, bestDiscountAmountOff }
  }
  const buyGetDiscount = discounts.find(discount => discount.type === 'buyGet') as BuyGetDiscount
  if (buyGetDiscount) {
      const discountDetails = calculateBuyGetDiscounts(items, buyGetDiscount)

      if (discountDetails?.totalDiscount && discountDetails?.totalDiscount > bestDiscountAmountOff) { 
        bestDiscountAmountOff = discountDetails?.totalDiscount ?? 0
        bestDiscountMessage = discountDetails?.message ?? null
        bestDiscount = buyGetDiscount
        discountedItems = discountDetails?.discountedItems as DiscountableItem[]
      }
  }

  let multiPlantAmountOff = 0
  const multiPlantDiscount = discounts.find(discount => discount.type === 'multiplePlants') as MultiPlantDiscount

  if (multiPlantDiscount) {
      if (cartItemCount >= multiPlantDiscount.parameters.minimumQuantity) {
          discounts.reduce(function (acc, obj) { return acc + obj.percent_off; }, 0);
          multiPlantAmountOff = Math.round((cartTotal * multiPlantDiscount.percent_off / 100) * 100) / 100
          if( multiPlantAmountOff > bestDiscountAmountOff) {
              bestDiscount = multiPlantDiscount
              bestDiscountAmountOff = multiPlantAmountOff
              bestDiscountMessage = `Your order qualifies for a ${multiPlantDiscount.percent_off}% discount!`
              discountedItems .length = 0
          }
      }
  }

  const siteWideDiscount = discounts.find(discount => discount.type === 'siteWide') as SiteWideDiscount
  if (siteWideDiscount) {
      const siteWideAmountOff = Math.round((cartTotal * siteWideDiscount.percent_off / 100) * 100) / 100
      if (siteWideAmountOff > bestDiscountAmountOff) {
          bestDiscount = siteWideDiscount
          bestDiscountMessage = `Your order qualifies for a ${siteWideDiscount.percent_off}% discount!`
          bestDiscountAmountOff = siteWideAmountOff
          discountedItems .length = 0
      }
  }
  
  return {
      bestDiscount,
      bestDiscountMessage,
      bestDiscountAmountOff,
      discountedItems
  }
}


type ArrItem = {
  id: string
  quantity: number
}
function spreadArray<T extends ArrItem>(arr: T[]) {
  const result: T[] = []
  for (const item of arr) {
    if (item.quantity === 1) {
      result.push(item)
    } else {
      for (let i = 0; i < item.quantity; i++) {
        const newArrItem = { ...item, quantity: 1 }
        result.push(newArrItem)
      }
    }
  }
  return result
}
function combineArray<T extends ArrItem>(arr: T[]): T[] {
  const combinedItems: { [id: string]: T } = {}

  for (const item of arr) {
    if (combinedItems[item.id]) {
      combinedItems[item.id].quantity += item.quantity
    } else {
      combinedItems[item.id] = { ...item }
    }
  }

  return Object.values(combinedItems)
}
