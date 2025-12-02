import type { Order } from "../../../types/Orders";

function getStatusMessage(data: Order) {
 let statusMessage = '';
  switch(data.orderStatus.status.toLocaleLowerCase()) {
    case 'shipped':
      statusMessage = 'has shipped!';
      break;
    case 'complete':
      statusMessage = 'is complete!';
      break;
    default:
      console.error(`Invalid status ${data.orderStatus.status}. Unable to generate email template`)
      return null;
}
  return statusMessage;
}

function getTrackingUrl(data: Order) {
  return `https://dangerlettuce.com/order-tracking/${data.orderStatus.trackingNumber}?carrier=${data.orderStatus.carrier.toLocaleLowerCase()}`
}

export function getTrackingStatusTemplate(data: Order) {
  return `
  <mj-section>
    <mj-column>
      <mj-text font-size="20px"><h1>Order ${data.id} ${getStatusMessage(data)}</h1></mj-text>
      <mj-text font-size="16px">${data.orderStatus.carrier} ${data.orderStatus.trackingNumber}</mj-text>
      <mj-button href="${getTrackingUrl(data)}" background-color="#69b91d" color="white">Track your order</mj-button>
      <mj-divider border-color="#69b91d" padding-top="24px"></mj-divider>
    </mj-column>  
  </mj-section>   
`
}
