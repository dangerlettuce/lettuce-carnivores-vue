<template>
    <div class="order-container">
        <Accordion type="single" class="w-full" collapsible :default-value="'0'">
            <AccordionItem v-for="order of props.orders" :key="order.id" :value="order.id.toString()">
                <AccordionTrigger class="accordion-header" :pt="{toggleicon: {style:{ 'margin-left': 'auto', 'margin-right':'.6rem'}}}">
                    <div class="grid-span-2 order-number">Order {{ order.id }}</div>
                    <div class="grid-span-2">{{ formatFirebaseDate(order.orderDate) }}</div>
                    <div v-if="isAdmin" class="grid-span-1">{{ order.lineItems.length }}</div>
                    <div class="grid-span-3 text-center">{{ order.orderStatus.status }}</div>
                </AccordionTrigger>
                <AccordionContent class="my-1">
                        <div class="shipping-info my-3">
                            <h5 class="my-3 text-lg">Shipping</h5>
                            <div class="flex justify-around gap-2">
                                <div class="ms-3">
                                    <div>{{ order.shippingInfo.name }}</div>
                                    <div>{{ order.shippingInfo.address.line1 }}</div>
                                    <div v-if="order.shippingInfo.address.line2">{{ order.shippingInfo.address.line2 }}</div>
                                    <div>{{`${order.shippingInfo.address.city} ${order.shippingInfo.address.state} ${order.shippingInfo.address.postal_code}` }}</div>
                                    <div>{{ order.shippingInfo.email }}</div>
                                </div>
                                <div>
                                    <div>{{order.shippingInfo.shippingType}} Shipping</div>
                                    <div>{{  order.orderStatus.trackingNumber !== '' ?
                                        order.orderStatus.trackingNumber :
                                        'Tracking number not yet assigned' }}
                                    </div>
                                </div>
                                <div>
                                    <BaseButton v-if="isAdmin" @click="openOrderStatusModal(order)" :key="order.id" type="info">Update Status</BaseButton>
                                    <BaseButton v-if="isAdmin && order.orderStatus.status === 'Shipped'" @click="markOrderComplete(order)" :key="order.id" type="info">Mark Complete</BaseButton>
                                </div>
                            </div>
                        </div>
                        <hr />
                        <div class="item-details my-3">
                            <h5 class="my-3 text-lg">Products</h5>
                            <OrderDetails :order :isAdmin />
                        </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    </div>
    <OrderStatusModal v-if="selectedOrder !== undefined" :order="selectedOrder" ref="orderStatusModal" />
</template>

<script setup lang="ts">
import { nextTick, type Ref, ref } from 'vue'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import OrderStatusModal from '@/components/OrderStatusModal.vue'
import type { Order } from '@/types/Orders'
import { USDollar, formatFirebaseDate } from '@/utils/utils';
import { useOrders } from '@/composables/useOrders';
import OrderDetails from './OrderDetails.vue'
const props = defineProps<{orders: Order[], isAdmin: boolean}>();

const orderStatusModal = ref()
const selectedOrder: Ref<Order | undefined> = ref(undefined)

const { markOrderComplete } = useOrders();
async function openOrderStatusModal(order: Order) {
    selectedOrder.value = order
    await nextTick()
    orderStatusModal.value.toggleModal()
}

const columnCount = props.isAdmin ? 7 : 6

</script>

<style scoped>
.order-container {
    min-width: 90dvw;
    margin: auto;
}
.item-grid {
    display: grid;
    grid-template-columns: repeat(v-bind(columnCount), minmax(2.8rem, 1fr));
    gap: 0.5rem 1rem;
}
.grid-span-1 {
    grid-column: span 1
}
.grid-span-2 {
    grid-column: span 2;
}
.grid-span-3 {
    grid-column: span 3
}
.item-name {
    text-wrap: balance;
    word-wrap:break-word;
    word-break:normal;
    grid-column: span 2;
}
.order-number {
    text-wrap: balance;
}
.accordion-header {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2rem, 1fr));
}
.total {
    display: grid;
    grid-template-columns: 12ch 12ch;
    max-width: 16rem;
}
.justify-right{
    text-align: end;
}

@media(min-width: 50rem) {
    .order-container {
        min-width: 42rem;
    }
}

</style>
