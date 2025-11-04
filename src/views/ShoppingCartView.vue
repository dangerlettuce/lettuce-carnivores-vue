<template>
  <div class="cart-layout">
    <div v-if="cartErrors !== null" class="cart-errors">
      <Alert class="alert-container bg-stone-50 border-2 border-red-400">
        <img src="@/assets/icons/sad-fly.png" alt="Sad fly" class="alert-icon" />
        <AlertDescription class="alert-text text-red-400">
          {{ cartErrors }}
        </AlertDescription>
      </Alert>
    </div>
  <div class="" v-if="cart.cartItems.length === 0">
    <p>Cart is empty</p>
  </div>
  
  <div class="cart-grid" v-else>
    <div class="cart-item-container">
      <TransitionGroup name="cart-list">
        <ShoppingCartItem 
          v-for="item in cart.cartItems" 
          :key="item.sku" 
          :item 
          @cart-items-changed="updateDiscounts"
          :discountedPrice="item.quantity === 1 ? getDiscountedPrice(item) : undefined"
        />
      </TransitionGroup>
    </div>
    <div class="subtotal-container">
      <div class="subtotal">
        <div v-if="totalDiscountAmount > 0" class="subtotal-line">
          <h3 class="m-0">Discount</h3>
          <h3 class="m-0">
            {{ USDollar.format(-totalDiscountAmount) }}
          </h3>
        </div>
        <div class="subtotal-line">
          <h3 class="m-0">Subtotal</h3>
          <h3 class="m-0">
            {{ `${USDollar.format(cartSubtotal)} ${!freeShipping ? '+ shipping' : ''}` }}
          </h3>
        </div>
        
        <div v-if="activeDiscountMessage !== null && activeDiscountMessage" class="flex row justify-center gap-2 mx-4">
          <h5 class="center-message discount-message">
            {{ activeDiscountMessage }}
          </h5>
        </div>

        <div class="flex row justify-center gap-2 mx-4">
          <h5 class="center-message">
            <template v-if="!isColdWeatherShippingActive">
              {{
                freeShipping
                ? `Free standard shipping on orders over $${discountedShippingThreshold}!`
                : `Add ${amountToQualifyForDiscountedShipping} to quality for free standard shipping.`
              }}
            </template>
            
            <template v-else>
              {{
                freeShipping
                ? `Free winter shipping on orders over $${discountedShippingThreshold}!`
                  : `Add ${amountToQualifyForDiscountedShipping} to quality for free winter shipping.`
              }}
            </template>
          </h5>
        </div>
      </div>
    </div>
    <footer v-if="isCheckoutDisabled === false" class="footer-sticky">
      <div class="checkout-actions">
        <BaseButton v-if="!isLoggedIn" type="info" @click="router.push('/login')">Login</BaseButton>
        
        <BaseButton type="checkout" @click.prevent="checkout" :disabled="cart.cartItems.length === 0 || isCheckoutLoading">
          {{ isLoggedIn ? `Checkout` : `Checkout as Guest` }}
          <span class="spinner-border" role="status" v-show="isCheckoutLoading"></span>
        </BaseButton>
      </div>
    </footer>
  </div>

</div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useOrderStore } from '@/stores/order'
import { ref, type Ref, computed, onMounted, TransitionGroup } from 'vue'
import type { CartItem } from '@/types/Orders'
import { toast } from 'vue3-toastify'
import { discountedShippingThreshold } from '@/constants/OrderConstants'
import { useUserStore } from '@/stores/users'
import { router } from '@/router'
import { USDollar } from '@/utils/utils';
import ShoppingCartItem from '@/components/ShoppingCartItem.vue'
import { isColdWeatherShippingActive } from '@/constants/OrderConstants'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'

const { cart, discountedItems, activeDiscount } = storeToRefs(useOrderStore())
const { getCategoryBySku, startCheckoutSession, validateCart, applyDiscounts } = useOrderStore()
const { cartTotal, isLoading } = storeToRefs(useOrderStore())
const { loginAnonymously  } = useUserStore()
const { isLoggedIn, user } = storeToRefs(useUserStore())

const isCheckoutDisabled = ref(false);
const amountToQualifyForDiscountedShipping = computed(() => {
  if (cartTotal.value - totalDiscountAmount.value >= discountedShippingThreshold) {
    return USDollar.format(0)
  } else {
    return USDollar.format(discountedShippingThreshold - cartTotal.value + totalDiscountAmount.value)
  }
})

const freeShipping = computed(() => {
  return cartTotal.value - totalDiscountAmount.value >= discountedShippingThreshold
})

const cartSubtotal = computed(() => {
  return cartTotal.value - totalDiscountAmount.value
})

const totalDiscountAmount = ref(0)

onMounted(async () => {
  await getCartErrors()
  await updateDiscounts()
  totalDiscountAmount.value = await applyDiscounts()
  cart.value.cartItems.forEach((item) => getCategoryBySku(item))
})

const isCheckoutLoading = computed(() => {
  return isLoading.value
})

const { activeDiscountMessage } = storeToRefs(useOrderStore())
async function updateDiscounts() {
  totalDiscountAmount.value = await applyDiscounts()
}

function getDiscountedPrice(item: CartItem) {
  const index = discountedItems.value?.findIndex(discountedItem => discountedItem.sku === item.sku)
  if (index === -1 || index === undefined ||  discountedItems.value === null) { return undefined }
  return discountedItems.value[index]?.priceAfterDiscount ?? undefined
}

async function checkout() {
  await getCartErrors()
  if (cartErrors.value !== null) {
    toast.error('Some items are no longer available, please review cart and try again')
    return
  }
  if (!user.value || user.value === null) {
    await loginAnonymously()
  }
  if (cart.value.cartItems.length > 0) {
    const res = await startCheckoutSession()
    if (!res || res.error === true || !res.data?.url) {
      console.error(res)
      toast.error('Unable to open checkout page')
      return
    }
    window.location.replace(res.data.url)
  }
}
const cartErrors: Ref<string | null> = ref(null)
async function getCartErrors() {
  cartErrors.value = null
  const errors = await validateCart()
  if (errors !== '') {
    cartErrors.value = errors
  }
}
</script>

<style scoped lang="scss">

.cart-layout {
  display: flex;
  flex-direction: column;
}
.footer-sticky {
  position: sticky;
  // TODO: make it so that it pins to bottom, but also moves up if cart is small
}

.center-message {
  margin: 0.5rem 0;
  text-align: center;
}

.spinner-border {
  height: 1rem;
  width: 1rem;
  margin-left: 1rem;
}
.cart-item-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.subtotal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 1rem;
  margin-right: 1rem;
}
.subtotal-line {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.subtotal-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
}
.alert-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.alert-icon {
  height: 6rem;
}
.alert-text {
  width: 100%;
}

.discount-message {
  background-color: $accent-orange;
  border-radius: .5rem;
  color: $dark;
  padding: 0.5rem;
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  
}
// .checkout-button {
//   border-radius: 0.5rem;
//   background: linear-gradient(0.15turn, #ffbf46, #fccb72, #ffbf46);
//   padding: 0.5rem 1.25rem;
//   border: none;
//   color: black;
//   font-size: 1.25rem;
//   font-weight: 500;
//   cursor: pointer;
//   box-shadow: 0 0 2px darkslategray;
// }
// .checkout-button:hover {
//   filter: brightness(105%);
// }
// .checkout-button:active {
//   box-shadow: 2px 3px darkslategray;
//   transform: translateY(4px);
// }
.checkout-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-evenly;
  background: $navbar-bg;
  //background: linear-gradient(0.4turn, #9fdb50, #ebf8e1, #3f87a6);
  padding: 0.6rem 0;
  border-radius: 1rem;
}

.cart-list-enter-active, .cart-list-leave-active {
  transition: all 0.5s ease;
}

.cart-list-enter, .cart-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
@media (min-width: 85rem) {
  .cart-grid {
    margin: auto;
    width: 40dvw;
  }
  .cart-item {
    gap: 2rem;
  }
  .cart-item-container {
    padding: 1rem 1rem;
  }
}
</style>
