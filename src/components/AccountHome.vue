<template>
  <section class="row justify-around">
    <p v-if="profile">{{ profile?.name.firstName + ' ' + profile?.name.lastName }}</p>
    <p v-if="profile">{{ profile?.contactInformation.email }}</p>
  </section>
  <OrdersList v-if="orders.length > 0" :orders :isAdmin="false" />
  <div v-else>No orders to display</div>
</template>

<script setup lang="ts">
import { onMounted, type Ref, ref } from 'vue';
import { useUserStore } from '@/stores/users';
import { storeToRefs } from 'pinia';
import OrdersList from '@/components/OrdersList.vue';
import { toast } from 'vue3-toastify';
import { findAll } from '@/apis/dataServices';
import type { Order } from '@/types/Orders';

const { profile } = storeToRefs(useUserStore());
const { user } = useUserStore();

const orders: Ref<Order[]> = ref([]);

async function findOrders() {
  if (!user || !user.uid) {
    toast.error('Unable to get orders');
    return;
  }
  const res = await findAll(`customers/${user.uid}/orders`);
  orders.value = res as Order[];
}

onMounted(() => {
  findOrders();
});
</script>

<style scoped>
section {
  padding: 0 clamp(0.05rem, 6vw, 20rem);
  margin: 2em 0;
}
ul {
  list-style: none;
}
</style>
