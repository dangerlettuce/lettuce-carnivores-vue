import type { Order } from "@/types/Orders"
import { executeFunction } from "@/utils/useFirebaseFunctions"

export const useTestEmail = import.meta.env.MODE === 'PRODUCTION' ? false : import.meta.env.VITE_TEST_EMAILS ?? false;


export function useEmailService() {

  async function sendOrderStatusEmail(order: Order) {
    if (useTestEmail === true || useTestEmail === 'true') {
      alert('Test email mode enabled, sending to test email address');
      order.shippingInfo.email = 'test@dangerlettuce.com';
    }
    return await executeFunction('sendOrderStatusEmail', order )
  }
  return {
    sendOrderStatusEmail
  }
}