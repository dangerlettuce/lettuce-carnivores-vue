import mjml2html from 'mjml';
import type { Order } from "../../types/Orders";
import { logoHeader } from './segments/logoHeader';
import { contactUsTemplate } from './segments/contactUsTemplate';
import { generateEmailHead } from './segments/emailHead';
import { generateOrderItemsTable } from './segments/orderItemsTable';

export function generateOrderConfirmationEmail(data: Order) {
  if (data.lineItems.length === 0 || !data.orderStatus.status || !data.id || !data.orderStatus.carrier || !data.orderStatus.trackingNumber ) {
    console.error(`Missing or invalid data. Unable to generate email template`)
    console.log(data);
    return null;
  }
  const headTitle = `Your Danger Lettuce order ${data.id} is confirmed!`;
  const emailPreview = `Your order has been received.`;
  let mjmlTemplate = `
    <mjml>
      ${generateEmailHead(headTitle, emailPreview)}
      <mj-body>
  `
  mjmlTemplate = mjmlTemplate + logoHeader;
  mjmlTemplate = mjmlTemplate + getOrderConfirmationTemplate(data);

  // TODO: Need to get these from the order.  Going to just use the stripe email for now
  // Order Number
  // Order Date / Time
  // Amount Paid
  // Payment Method


  // Order Summary
   mjmlTemplate = mjmlTemplate + generateOrderItemsTable(data, `Order summary:`);

  // Contribution to remove CO2


  // Need to modify or cancel?

  mjmlTemplate = mjmlTemplate + contactUsTemplate;
  mjmlTemplate = mjmlTemplate + `
      </mj-body>
    </mjml>
  `
  return mjml2html(mjmlTemplate).html;;
}

function getOrderConfirmationTemplate(data: Order) {

}