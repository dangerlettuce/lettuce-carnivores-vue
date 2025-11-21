<template>
  <div v-for="order in ordersToProcess" :key="order.id" class="picklist-text">
    <ul class="picklist-text">{{ `${order.id} - ${order.shippingInfo.name} - ${order.shippingInfo.shippingType}` }}</ul>
    <li v-for="item in order.lineItems" :key="item.price_data.product_data.metadata.sku" class="order-item">
      <span class="square" />{{ `${item.price_data.product_data.metadata.shelfLocation} - ${item.price_data.product_data.metadata.size} - ${item.price_data.product_data.metadata.sku} - ${item.price_data.product_data.name}` }}
    </li>
    <br />
  </div>

</template>

<script setup lang="ts">
import type { Order } from '@/types/Orders';
import { computed, type PropType } from 'vue';


const props = defineProps({ orders: { type: Array as PropType<Order[]>, required: true } })

const ordersToProcess = computed(() => {
  return props.orders.filter(order => order.orderStatus.status === 'Processing')
})


</script>

<style lang="css" scoped>
  .order-item {
    padding: .4rem 10ch;
  }
  .square {
    display: inline-block;
    height: 1rem;
    width: 1rem;
    background-color: #ffffff;
    border: 2px solid black;
    margin: auto 2ch;
  }
  .picklist-text {
    color: black;
  }
  ul, li {
    font-size: 1.2rem;
  }
</style>