<template>
    <div class="layout">
        <OrdersList v-if="orders.length > 0" :orders :isAdmin="true" class="hide-print" />
        <div v-else>No orders to display</div>
        <div class="row gap-2 mt-4 justify-space-around hide-print">
            <BaseButton @click="fetchOpenOrders">View Open Orders</BaseButton>
            <BaseButton type="info" @click="findAllOrders">View All Orders</BaseButton>
        </div>
        <OrderPickList :orders />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref,} from 'vue';
import { findAll, findByProperty } from '@/apis/dataServices';
import { toast } from 'vue3-toastify'
import { sortNumerically } from '@/utils/utils'
import OrdersList from '@/components/OrdersList.vue'
import type { Order } from '@/types/Orders'
import OrderPickList from './OrderPickList.vue';
const orders: Ref<Order[]> = ref([])
const isLoading = ref(false)
onMounted(()=>{
    fetchOpenOrders()
})

const fetchOpenOrders = async () => {
    isLoading.value = true
    try{
        const res = await findByProperty('orders', 'orderStatus.status', '!=', 'Complete')
        if(res !== undefined && res.length !== 0) {
            sortNumerically(res)
            orders.value = res as Order[]
        } 
    } catch (e: any) {
        console.error(e)
        toast.error('Error fetching orders')
    } finally {
        isLoading.value = false
    }
}

async function findAllOrders() {
    const res = await findAll(`orders`)
    if(res) {
        sortNumerically(res)
        orders.value = res as Order[]
    }
}

</script>

<style scoped>
    .layout {
        width: 100%;
        display: flex;
        flex-direction: column;
    }

    @media print {
        .hide-print {
            display: none;
        }
    }
</style>