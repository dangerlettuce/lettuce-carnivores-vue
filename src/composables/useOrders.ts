import { ref } from "vue"
import { saveItem } from '@/apis/dataServices'
import type { Order } from "@/types/Orders"
import { toast } from 'vue3-toastify';
import { useEmailService } from "@/composables/useEmailService"

const { sendOrderStatusEmail } = useEmailService();
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

  async function sendOrderShippedEmail(order: Order) {
    if (!order.orderStatus.trackingNumber || !order.orderStatus.carrier) {
        toast.error('Tracking number or carrier missing, mark shipped')
        return;
    }
    isSaving.value = true
    order.orderStatus.status = 'Shipped';
    await saveOrder(order);
    try {
        const response =  await sendOrderStatusEmail(order);
        if(response.success) {
            toast.success('Shipping notification email sent')
        } else {
            toast.error(`Error sending email: ${response.message}`)
        }
    } catch (e: any) {
        toast.error(`Error sending email: ${e.toString()}`)
    } finally {
        isSaving.value = false
    } 
  }

  return {
    isSaving,
    saveOrder,
    markOrderComplete,
    sendOrderShippedEmail
  }
}