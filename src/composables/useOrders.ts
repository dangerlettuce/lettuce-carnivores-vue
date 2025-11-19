import { ref } from "vue"
import { saveItem } from '@/apis/dataServices'
import type { Order } from "@/types/Orders"
import { toast } from 'vue3-toastify';

export function useOrders() {
  const isSaving = ref(false)

  async function saveOrder(order: Order) {

    isSaving.value = true
    try {
        await saveItem('orders', order)
        toast.success('Saved to orders')
        await saveItem(`customers/${order.customer}/orders`, order)
        toast.success('Saved to customer/orders')
    } catch (e: any) {
        throw new Error(e.toString())
    } finally {
        isSaving.value = false
    }
    //save to orders collection
    //save to customer/uid/orders collection
  }

  async function markOrderComplete(order: Order) {
    isSaving.value = true
    order.orderStatus.status = 'Complete';
    await saveOrder(order);
  }

  return {
    isSaving,
    saveOrder,
    markOrderComplete
  }
}