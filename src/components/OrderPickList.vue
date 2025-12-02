<template>
  <div v-for="order in ordersToProcess" :key="order.id" class="black-text packing-slip page">
    <div class="order-picklist-header">
      <div class="packing-slip-logo-container">
        <img class="packing-slip-logo" src="/src/assets/logo/LogoWithBugNoText.png" />
        <img class="packing-slip-logo" src="/src/assets/logo/DangerLettuceStackedText.png" />
      </div>
      <div class="order-id-container">
        <h2>{{ `Order #${order.id}` }}</h2>
        <h2>{{ `Order Date: ${formatDate(order.orderDate)}` }}</h2>
      </div>
    </div>
    <section class="shipping-picklist">
      <p>{{`${getShippingType(order)} Shipping`}}</p>
      <div class="ship-to">
        <p style="font-weight: 600;">Ship to:</p>
        <p>{{ order.shippingInfo.name }}</p>
        <p>{{ order.shippingInfo.address.line1 }}</p>
        <p v-if="order.shippingInfo.address.line2">{{ order.shippingInfo.address.line2 }}</p>
        <p>{{ `${order.shippingInfo.address.city}, ${order.shippingInfo.address.state} ${order.shippingInfo.address.postal_code}` }}</p>
      </div>
    </section>


    <ul class="black-text">
      <li v-for="item in order.lineItems" :key="item.price_data.product_data.metadata.sku" class="order-item">
        <span class="square" />{{`${item.price_data.product_data.metadata.sku} - ${item.price_data.product_data.name} - ${item.price_data.product_data.metadata.size}` }}
      </li>
    </ul>
    <br />
  </div>

  <div>
    <ol>
      <li v-for="item in pickList" :key="item">{{ item }}</li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '@/types/Orders';
import { formatDate } from '@/utils/utils';
import { computed, type PropType } from 'vue';


const props = defineProps({ orders: { type: Array as PropType<Order[]>, required: true } })

const ordersToProcess = computed(() => {
  const orders = props.orders.filter(order => order.orderStatus.status === 'Processing')


  return orders;
})

const pickList = computed(() => {
  const list: string[] = [];
  ordersToProcess.value.forEach(order => {
    order.lineItems.forEach(item => {
      const itemString = `${item.price_data.product_data.metadata.sku} - ${item.price_data.product_data.metadata.size} - ${item.price_data.product_data.name}`;
      list.push(itemString);
    });
  });
  return list.sort((a, b) => a.localeCompare(b));
});

// TEMP: Stripe is all fucked up because you forgot the break so now you gotta leave this shit here until those flow through dumbass.
 const standardShippingId = 'shr_1PhcE1HlHApXEku9jEjOnRY5'
 const expeditedShippingId = 'shr_1PhcIRHlHApXEku9VDJcMwh1'
 const discountedStandardShippingId = 'shr_1PhcE6HlHApXEku9pLjd8otH'
 const discountedExpeditedShippingId = 'shr_1R2cEFHlHApXEku99i2HiYTx'
 const coldWeatherShippingId = 'shr_1QgwacHlHApXEku9NOmO8GBA'
 const discountedColdWeatherShippingId = 'shr_1Qgwb2HlHApXEku9geKIWtCT'
 const mossShippingId = 'shr_1R4ZfVHlHApXEku9ZqnKMqC2'

function getShippingType(shippingCost: any | string) {
  let shippingId = null;
  if (typeof shippingCost === 'string' && shippingCost.length > 20) {
    shippingId = shippingCost;
  }
  if (shippingCost && typeof shippingCost === 'object' && 'shipping_rate' in shippingCost) {
    shippingId = shippingCost.shipping_rate;
  }
  if (shippingId === null && 'fullResponse' in shippingCost) {
    shippingId = shippingCost.fullResponse.shipping_cost.shipping_rate;
  }
  if (shippingId === null) {
    console.error(`Unable to parse shippingId from checkout data ${shippingCost}`)
  } 
  let shippingType = null;
  switch (shippingId) { 
    case coldWeatherShippingId:
    case discountedColdWeatherShippingId:
      shippingType = 'Cold Weather'
      break;
    case expeditedShippingId:
    case discountedExpeditedShippingId:
      shippingType = 'Expedited'
      break;
    case standardShippingId:
    case discountedStandardShippingId:
      shippingType = 'Standard'
      break;
    default:
      console.error(`Unknown shipping ID ${shippingId}`)
      shippingType = 'Unknown';
  }
  return shippingType;

}

</script>

<style scoped lang="css">
  h2 {
    font-weight: 600;
  }
  .packing-slip-logo-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    img {
      height: 4rem;
      padding-inline: .5rem;
    }

  }

  .packing-slip-header {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    margin-block: 2rem;
  }
  .shipping {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin-block: 1rem;
  }


  .order-item {
    padding: .4rem .1rem;
  }

  .packing-slip { 
    margin-top: 2rem;
  }

  .square {
    display: inline-block;
    height: 1rem;
    width: 1rem;
    background-color: #ffffff;
    border: 2px solid black;
    margin: auto 2ch;
  }
  .black-text {
    color: black;

  }
  ul, li {
    font-size: 1.2rem;
    text-align: left;
  }

  ol {
    text-align: left;
  }


</style>

<style>
/* Styles not scoped so that print media query can hide other crap */
  @media print {
    .page, .page-break { break-after: page; }

    .order { 
      margin-block-start: 3rem;
      border-top: none;
    }

    /* Doesn't seem to work... TODO */
    header, footer {
      display: none;

    }
    .__vue-devtools-container__ {
      display: none;
    }
    .button-container {
      display: none;
    }
    .order-container {
      display: none;
    }
  }
</style>