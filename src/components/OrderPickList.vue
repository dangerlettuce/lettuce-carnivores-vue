<template>
  <div class="page"></div>
  <div v-for="order in ordersToProcess" :key="order.id" class="picklist-text order-packing-list page">
    <div class="order-picklist-header">
      <div class="picklist-logo-container">
        <img class="packing-list-logo" src="/src/assets/logo/LogoWithBugLettuceCentered.png" />
        <img class="packing-list-logo" src="/src/assets/logo/DangerLettuceStackedText.png" />
      </div>
      <div>
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


    <ul class="picklist-text">
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
    console.log(getShippingType(order.fullResponse.shipping_cost.shipping_rate))
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

<style lang="css">
/* Styles not scoped so that print media query can hide other crap */
  h2 {
    font-weight: 600;
  }
  .picklist-logo-container {
    display: flex;
    flex-direction: row;
    justify-content: space-around;

  }
  .packing-list-logo {
    height: 6rem;

  }
  .order-picklist-header {
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

  .order-packing-list { 
    margin-top: 2rem;
    border-top: 2px solid black;
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
    text-align: left;
  }

  ol {
    text-align: left;
  }

  @media print {
    .page, .page-break { break-after: page; }

    .order { 
      margin-block-start: 3rem;
      border-top: none;
    }

    /* Doesn't seem to work... TODO */
    header {
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