import type { DiscountableItem, BuyGetDiscount } from '@/types/Orders'

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
      const itemPrice = item?.price ?? item?.unit_amount ?? 0
      const discountedPrice = itemPrice * (discount.percent_off / 100)
      totalDiscount += discountedPrice
      discountedItems.push({ ...item, priceAfterDiscount: (itemPrice - discountedPrice)})
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
