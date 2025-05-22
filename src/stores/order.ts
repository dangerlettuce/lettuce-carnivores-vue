import { defineStore } from 'pinia'
import { computed, type Ref, ref } from 'vue'
import type{ BuyGetDiscount, CartItem, Discount, MultiPlantDiscount, ShoppingCart, SiteWideDiscount } from '@/types/Orders'
import { newShoppingCart } from '@/constants/OrderConstants'
import { usePlantStore } from '@/stores/plant'
import { type PlantCategory } from '@/types/Plant'
import { useLocalStorage } from '@vueuse/core'
import {createStripeCheckoutSession} from '@/apis/stripe'
import { findAll, getPlantsFromFirestore } from '@/apis/dataServices'
import { calculateBuyGetDiscounts } from '@/composables/useDiscountCalculator'
import { Timestamp } from 'firebase/firestore'

export const useOrderStore = defineStore('order', () => {
    const isLoading = ref(false)
    const cart: Ref<ShoppingCart> = ref(useLocalStorage('cart',{...newShoppingCart}))
    const cartItemCount = computed(() => {
        const cartCount = cart.value.cartItems.reduce(
            (accumulator, cartItem) => accumulator + cartItem.quantity,
            0
          );
        return cartCount
    })
    const cartTotal = computed(() => {
        return cart.value.cartItems.reduce(
            (accumulator, cartItem) => accumulator + (cartItem.price * cartItem.quantity), 0)
    })

    const addItemToCart = async (item: CartItem) => {
        const cartIndex = cart?.value.cartItems.findIndex(cartItem => cartItem.sku === item.sku)
        if(cart && cartIndex !== undefined) {
            const {plant} = await getCategoryBySku(item)
            if(!plant?.isRepresentative && cartIndex !== -1) {
                return {success: true, message: 'That item is already in your cart'}
            }
            if(!plant|| plant.quantity === 0) {
                return {success: false, message: 'Unable to add to cart, quantity not available'}
            }
            if(cartIndex === -1) {
                cart.value.cartItems.push(item)
                return {success: true, message: 'Added to cart!'}
            }
            if (cart?.value.cartItems[cartIndex].quantity < plant.quantity) {
                cart.value.cartItems[cartIndex].quantity ++
                return {success: true, message: 'Added to cart!'}
            } else {
                return {success: false, message: 'Unable to add to cart, quantity not available'}
            }
        }
        return {success: false, message: 'Unable to get cart'}
    }


    const getCategoryBySku = async (item: CartItem) => {
        try {
            const category: PlantCategory = await usePlantStore().findPlantCategoryById(item.categoryId)
            const plant = category.plants.find(plantItem => plantItem.sku === item.sku)
            return {category, plant}
        } catch (e: any) {
            console.error(e)
            throw new Error('Unable to add to cart')
        }
    }

    const removeItemFromCart = (item: CartItem, deleteItem: boolean) => {
        const cartIndex = cart?.value.cartItems.findIndex(cartItem => cartItem.sku === item.sku)
        if(cart && cartIndex !== -1 && cartIndex !== undefined) {
            if(deleteItem) {
                cart.value.cartItems.splice(cartIndex,1)
                return
            }
            if(cart.value.cartItems[cartIndex].quantity > 1) {
                cart.value.cartItems[cartIndex].quantity --
                return
            }
            if(cart.value.cartItems[cartIndex].quantity = 1) {
                cart.value.cartItems.splice(cartIndex,1)
                return
            }
        }
    }

    function resetCart () {
        if(cart && cart.value) {
            cart.value.cartItems.length = 0
            applyDiscounts()
        }
    }

    async function startCheckoutSession() {
        isLoading.value = true
        try{
            const session = await createStripeCheckoutSession(cart.value.cartItems)
            //@ts-ignore
            return {success: true, error: false, message: `Success`, data: session.data}
        } catch (e: any) {
            console.error(e)
            return {success: false, error: true, message: `Unable to create checkout session`}
        } finally {
            isLoading.value = false
        }
    }

    async function validateCart(): Promise<string | null> {
        const plantData = await getPlantsFromFirestore(cart.value.cartItems)
        let errors = []
        for (let index = cart.value.cartItems.length - 1; index >= 0; index--) {
            const item = cart.value.cartItems[index];
            const dbPlant = plantData.find((plant) => plant.sku === item.sku)
            if (!dbPlant || ['In Stock', 'Hidden'].includes(dbPlant.status) === false || dbPlant.quantity === 0) {
                cart.value.cartItems.splice(index, 1)
                errors.push(`${item.name} - ${item.sku}: this item is no longer available and has been removed from your cart.`)
            } else {
                if (item.quantity > dbPlant.quantity) {
                    cart.value.cartItems[index].quantity = dbPlant.quantity
                    errors.push(`${item.name} - ${item.sku}: The requested quantity is no longer available, your cart has been adjusted.\n`)
                }
                if (item.price !== dbPlant.price) {
                    cart.value.cartItems[index].price = dbPlant.price
                    errors.push(`${item.name} - ${item.sku}: The price has changed, your cart has been adjusted.\n`)
                }
            }
        }
        return errors.length === 0 ? null : errors.join('\n')
    }

    const activeDiscount: Ref<Discount | null> = ref(null)
    const activeDiscountMessage: Ref<string | null> = ref(null)
    const discountedItems: Ref<CartItem[] | null> = ref(null)
    async function applyDiscounts() {
        const discounts = await getDiscounts(cart.value)
        let bestDiscount = null
        let bestDiscountMessage = null
        let bestDiscountAmountOff = 0
        if (!discounts || !discounts.discountValues) {
            activeDiscount.value = bestDiscount
            activeDiscountMessage.value = bestDiscountMessage
            discountedItems.value = null
            return 0
        }
        if (discounts?.discountValues.length === 1) {
            bestDiscount = discounts.discountValues[0]
            activeDiscountMessage.value = bestDiscount.message
        }

        const buyGetDiscount = discounts.discountValues.find(discount => discount.type === 'buyGet') as BuyGetDiscount
        if (buyGetDiscount) {
            const discountDetails = calculateBuyGetDiscounts(cart.value.cartItems, buyGetDiscount)
            activeDiscount.value = buyGetDiscount
            activeDiscountMessage.value = discountDetails?.message ?? null
            discountedItems.value = discountDetails?.discountedItems as CartItem[]
            if (discountDetails?.totalDiscount && discountDetails?.totalDiscount > bestDiscountAmountOff) { 
                bestDiscountAmountOff = discountDetails?.totalDiscount ?? 0
                bestDiscountMessage = discountDetails?.message ?? null
                bestDiscount = buyGetDiscount
            }
        }

        let multiPlantAmountOff = 0
        const multiPlantDiscount = discounts.discountValues.find(discount => discount.type === 'multiplePlants') as MultiPlantDiscount
        if (multiPlantDiscount) {
            if (cartItemCount.value >= multiPlantDiscount.parameters.minimumQuantity) {
                discounts.discountValues.reduce(function (acc, obj) { return acc + obj.percent_off; }, 0);
                multiPlantAmountOff = Math.round((cartTotal.value * multiPlantDiscount.percent_off / 100) * 100) / 100
                if( multiPlantAmountOff > bestDiscountAmountOff) {
                    bestDiscount = multiPlantDiscount
                    bestDiscountAmountOff = multiPlantAmountOff
                    bestDiscountMessage = `Your order qualifies for a ${multiPlantDiscount.percent_off}% discount!`
                }
            } else {
                bestDiscountMessage ??= multiPlantDiscount.message
            }
            
        }

        const siteWideDiscount = discounts.discountValues.find(discount => discount.type === 'siteWide') as SiteWideDiscount
        if (siteWideDiscount) {
            const siteWideAmountOff = Math.round((cartTotal.value * siteWideDiscount.percent_off / 100) * 100) / 100
            if (siteWideAmountOff > bestDiscountAmountOff) {
                bestDiscount = siteWideDiscount
                bestDiscountMessage = `Your order qualifies for a ${siteWideDiscount.percent_off}% discount!`
                bestDiscountAmountOff = siteWideAmountOff
            } else {
                bestDiscountMessage ??= siteWideDiscount.message
            }
        }
        
        activeDiscount.value ??= bestDiscount
        activeDiscountMessage.value ??= bestDiscountMessage
        return Math.max(bestDiscountAmountOff)
    }

    const discountDocs: Ref<Discount[] | undefined> = ref()

    async function getActiveDiscounts() {
        if(discountDocs.value === undefined ) {
            discountDocs.value = await findAll('discounts') as Discount[]
        }
        if(!discountDocs.value || discountDocs.value.length === 0) { return undefined}
        return discountDocs.value.filter(item => item.valid && item.validThrough.toMillis() >= Timestamp.now().toMillis())
    }

    async function getDiscounts(cart: ShoppingCart) {
        const activeDiscounts = await getActiveDiscounts()
        if(!activeDiscounts || !cart.cartItems || cart.cartItems.length === 0) {
            return null
        }

        const discountValues: Discount[] = []
        const buyGetDiscount = activeDiscounts.find(item => item.type === 'buyGet') as BuyGetDiscount
        if (buyGetDiscount) {
            discountValues.push(buyGetDiscount)
        }
        const multiPlantDiscount = activeDiscounts.find(item => item.type === 'multiplePlants') as MultiPlantDiscount
        if (multiPlantDiscount && !buyGetDiscount) {
            discountValues.push(multiPlantDiscount)
        }
        const siteWideDiscount = activeDiscounts.find(item => item.type === 'siteWide') as SiteWideDiscount
        if(siteWideDiscount && siteWideDiscount.id !== null) {
            discountValues.push(siteWideDiscount)
        }
        return {
            discountValues: discountValues
        }
    }
    return {
        cart,
        cartItemCount,
        getCategoryBySku,
        addItemToCart,
        removeItemFromCart,
        validateCart,
        resetCart,
        startCheckoutSession,
        cartTotal,
        isLoading,
        applyDiscounts,
        getActiveDiscounts,
        activeDiscount,
        activeDiscountMessage,
        discountedItems
    }
})
