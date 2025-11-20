import type { Order } from "@/types/Orders"
import { executeFunction } from "@/utils/useFirebaseFunctions"


export function useEmailService() {

  async function sendOrderStatusEmail(order: Order) {
    return await executeFunction('sendOrderStatusEmail', order )
  }
  return {
    sendOrderStatusEmail
  }
}