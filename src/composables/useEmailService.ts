import type { Order } from "@/types/Orders"
import { executeFunction } from "@/utils/useFirebaseFunctions"

export const useTestEmail = import.meta.env.MODE === 'PRODUCTION' ? false : import.meta.env.VITE_TEST_EMAILS;


export function useEmailService() {

  async function sendOrderStatusEmail(order: Order) {    
    if (useTestEmail) {
      order.shippingInfo.email = 'test@dangerlettuce.com';
    }
    return await executeFunction('sendOrderStatusEmail', order )
  }
  return {
    sendOrderStatusEmail
  }
}