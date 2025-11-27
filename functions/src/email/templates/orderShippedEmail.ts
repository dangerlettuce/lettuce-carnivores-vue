import mjml2html from 'mjml';
import type { Order } from '../../types/Orders';
import { logoHeader } from './logoHeader';
import { getTrackingStatusTemplate } from './shippingInfo';
import { getOrderFeedbackTemplate } from './orderFeedback';
import { contactUsTemplate } from './contactUsTemplate';
import { generateEmailHead } from './emailHead';

export function generateOrderStatusUpdate(data: Order) {
  if (data.lineItems.length === 0 || !data.orderStatus.status || !data.id || !data.orderStatus.carrier || !data.orderStatus.trackingNumber ) {
    console.error(`Missing or invalid data. Unable to generate email template`)
    console.log(data);
    return null;
  }

  const headTitle = `Your Danger Lettuce order ${data.id} was shipped!`;
  const emailPreview = `Track your order with ${data.orderStatus.carrier}`;
  // Add head and tracking info
  let mjmlTemplate = `
    <mjml>
      ${generateEmailHead(headTitle, emailPreview)}
      <mj-body>
  `
  mjmlTemplate = mjmlTemplate + logoHeader;
  mjmlTemplate = mjmlTemplate + getTrackingStatusTemplate(data);

  // Start of item list
  mjmlTemplate = mjmlTemplate + `
      <mj-section padding="0">
        <mj-column>
          <mj-text font-size="16px"><h2 style="margin: 0">Included in this order:</h2></mj-text>
            <mj-table>
  `
  
  // Add cart items
  data.lineItems.forEach(item => {
    mjmlTemplate = mjmlTemplate + `
      <tr style="border-bottom:1px dashed lightgrey;">
        <td align="left">
          <p style="font-size: 14px; padding: 10 0 0 0; margin: 0px">${item.price_data.product_data.name}</p>
          <p style="font-size: 12px; padding: 4px 0px; margin: 0px">${item.price_data.product_data.metadata.size}</p>
          <p style="font-size: 12px; padding: 0 0 10 0; margin: 0px">SKU: ${item.price_data.product_data.metadata.sku}</p>
        </td>
        <td align="center" style="min-width: 24px">x${item.quantity}</td>
        <td align="right">${formatPrice(item.price_data.unit_amount)}</td>
      </tr>
    `
  })
// Add discount
if (data.cartTotal.amount_discount != 0) {
  mjmlTemplate = mjmlTemplate + `
    <tr style="border-bottom:1px dashed lightgrey;">
      <td align="left">Shipping</td>
      <td align="center"></td>
      <td align="right">${formatPrice(data.cartTotal.amount_discount)}</td>
    </tr>
  `
}

  // Add shipping/tax/total
mjmlTemplate = mjmlTemplate + `
              <tr style="border-bottom:1px dashed lightgrey;">
                <td align="left">Shipping</td>
                <td align="center"></td>
                <td align="right">${formatPrice(data.cartTotal.amount_shipping)}</td>
              </tr>
              <tr style="border-bottom:1px dashed lightgrey;">
                <td align="left">Tax</td>
                <td align="center"></td>
                <td align="right">${formatPrice(data.cartTotal.amount_tax)}</td>
              </tr>
              <tr style="border-bottom:1px dashed lightgrey;">
                <td align="left" style="font-weight:bold;">Total</td>
                <td align="center"></td>
                <td align="right" style="font-weight:bold;">${formatPrice(data.cartTotal.amountTotal)}</td>
              </tr>
          
            </mj-table>

        </mj-column>

      </mj-section>
`
// Add footer
mjmlTemplate = mjmlTemplate + getOrderFeedbackTemplate(data);
mjmlTemplate = mjmlTemplate + contactUsTemplate;
mjmlTemplate = mjmlTemplate + `
    </mj-body>
  </mjml>
`

  return mjml2html(mjmlTemplate).html;
}

function formatPrice(price: number) {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
  return USDollar.format(price / 100);
}
