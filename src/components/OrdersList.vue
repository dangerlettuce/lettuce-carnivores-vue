<template>
  <div class="order-container">
    <Accordion type="single" class="w-full" collapsible :default-value="'0'">
      <AccordionItem v-for="order of props.orders" :key="order.id" :value="order.id.toString()">
        <AccordionTrigger class="accordion-header"
          :pt="{ toggleicon: { style: { 'margin-left': 'auto', 'margin-right': '.6rem' } } }">
          <div class="grid-span-2 order-number">Order {{ order.id }}</div>
          <div class="grid-span-2">{{ formatFirebaseDate(order.orderDate) }}</div>
          <div v-if="isAdmin" class="grid-span-1">{{ order.lineItems.length }}</div>
          <div class="grid-span-3 text-center">{{ order.orderStatus.status }}</div>
        </AccordionTrigger>
        <AccordionContent class="my-1">
          <div class="shipping my-3">
            <h5 class="my-3 text-lg">Shipping</h5>
            <div class="flex justify-around gap-2">
              <div class="ms-3">
                <div>{{ order.shippingInfo.name }}</div>
                <div>{{ order.shippingInfo.address.line1 }}</div>
                <div v-if="order.shippingInfo.address.line2">{{ order.shippingInfo.address.line2 }}</div>
                <div>
                  {{ `${order.shippingInfo.address.city} ${order.shippingInfo.address.state} ${order.shippingInfo.address.postal_code}` }}
                </div>
                <div>{{ order.shippingInfo.email }}</div>
              </div>
              <div>
                <div>{{ order.shippingInfo.shippingType }} Shipping</div>
                <div>
                  {{ order.orderStatus.trackingNumber !== '' ? order.orderStatus.trackingNumber : 'Tracking number not yet assigned' }}
                </div>
              </div>
              <div v-if="isAdmin" class="admin-actions">
                <div class="shipping-info"
                  v-if="order.orderStatus.status !== 'Shipped' && order.orderStatus.status !== 'Complete'">
                  <label for="dimensions">Dimensions</label>
                  <div class="length-width-height">
                    <input type="text" placeholder="L" v-model="order.shippingInfo.package.length" />
                    <p>x</p>
                    <input type="text" placeholder="W" v-model="order.shippingInfo.package.width" />
                    <p>x</p>
                    <input type="text" placeholder="H" v-model="order.shippingInfo.package.height" />
                  </div>
                  <label for="weight">Weight</label>
                  <input type="text" placeholder="Weight" name="weight"
                    v-model="order.shippingInfo.package.weight" />
                  <label for="tracking">Tracking</label>
                  <input type="text" placeholder="Tracking Number" name="tracking"
                    v-model="order.orderStatus.trackingNumber" @change="setCarrier(order)" />
                  <label for="carrier">Carrier</label>
                  <input type="text" placeholder="Carrier" name="carrier" v-model="order.orderStatus.carrier" />
                  <label for="status">Status</label>
                  <input name="status" v-model="order.orderStatus.status" />
                </div>
                <BaseButton v-if="order.orderStatus.status !== 'Complete' && order.orderStatus.status !== 'Shipped'"
                  @click="saveOrder(order)" type="info">Save
                </BaseButton>
                <BaseButton v-if="order.orderStatus.status !== 'Complete' && order.orderStatus.status !== 'Processing'"
                  @click="openOrderStatusModal(order)">Update
                  Status</BaseButton>
                <BaseButton v-if="order.orderStatus.status === 'Processing'" @click="sendOrderShippedEmail(order)">Send
                  Shipped Notification</BaseButton>
                <BaseButton v-if="order.orderStatus.status === 'Shipped'" @click="markOrderComplete(order)"
                  :key="order.id">Mark Complete</BaseButton>
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
  import { nextTick, type Ref, ref } from 'vue';
  import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
  import OrderStatusModal from '@/components/OrderStatusModal.vue';
  import type { Order } from '@/types/Orders';
  import { formatFirebaseDate } from '@/utils/utils';
  import { useOrders } from '@/composables/useOrders';
  import OrderDetails from './OrderDetails.vue';
  import { getCarrier } from '@/composables/useShippingUtils';
  import BaseButton from './ui/BaseButton.vue';
  const props = defineProps<{ orders: Order[]; isAdmin: boolean }>();

  const orderStatusModal = ref();
  const selectedOrder: Ref<Order | undefined> = ref(undefined);

  const { markOrderComplete, sendOrderShippedEmail, saveOrder } = useOrders();

  async function openOrderStatusModal(order: Order) {
    selectedOrder.value = order;
    await nextTick();
    orderStatusModal.value.toggleModal();
  }

  function setCarrier(order: Order) {
    const carrier = getCarrier(order.orderStatus.trackingNumber);
    if (carrier) {
      order.orderStatus.carrier = carrier;
    }
  }

  const columnCount = props.isAdmin ? 7 : 6;
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
    grid-column: span 1;
  }

  .grid-span-2 {
    grid-column: span 2;
  }

  .grid-span-3 {
    grid-column: span 3;
  }

  .item-name {
    text-wrap: balance;
    word-wrap: break-word;
    word-break: normal;
    grid-column: span 2;
  }

  .order-number {
    text-wrap: balance;
  }

  .shipping-info {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 90px 140px;
  }

  .length-width-height {
    display: grid;
    grid-template-columns: 24px 8px 24px 8px 24px;
    gap: 6px;

    input {
      padding-inline: .2rem;
    }
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

  .justify-right {
    text-align: end;
  }

  .admin-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  @media (min-width: 50rem) {
    .order-container {
      min-width: 42rem;
    }
  }
</style>
