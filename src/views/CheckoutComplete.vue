<template> 
    <div class="text-center mt-4">
        <div>
            <h2>Thank you for your purchase!</h2>
        </div>
        <div class="my-3">
            <h3>What's next?</h3>
            <p v-if="!isColdWeatherShippingActive">Most orders are shipped within 1-2 business day</p>
            <p v-else>Cold weather shipping - shipping will be planned to avoid very cold temperatures.  A heat pack and insulation will be included when necessary. All orders are covered by our live arrival guarantee. If temperatures are very cold for an extended duration, we will contact you to discuss or you can reach out to us via email or Instagram</p>
            <div class="mb-2">
                <a href="https://www.instagram.com/dangerlettuce/" target="_blank">Follow us on Instagram</a>
            </div>
            <router-link to="care">Click here to learn about care for your new plants</router-link>
            <div v-if="user!.isAnonymous">
                <router-link to="/login">Create an account to track your orders</router-link>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/users';
import { storeToRefs } from 'pinia'
import { isColdWeatherShippingActive } from '@/constants/OrderConstants'
import { event } from 'vue-gtag'
const {user} = storeToRefs(useUserStore())
const { resetCart } = useOrderStore()
const { cart, cartTotal, activeDiscount } = storeToRefs(useOrderStore())

onMounted(() => {
    event('conversion_event_purchase', {
        amount: cartTotal.value,
        discount: {
            id: activeDiscount.value?.id,
            type: activeDiscount.value?.type,
            message: activeDiscount.value?.message,
        },
        cartItems: cart.value.cartItems.map((item) => ({
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
        })),
        user: {
            id: user.value?.uid,
            email: user.value?.email,
            isAnonymous: user.value?.isAnonymous,
        }
    })

    resetCart();
})
</script>
