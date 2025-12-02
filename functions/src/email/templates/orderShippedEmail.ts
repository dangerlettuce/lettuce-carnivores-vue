import mjml2html from 'mjml';
import type { Order } from '../../types/Orders';
import { logoHeader } from './segments/logoHeader';
import { getTrackingStatusTemplate } from './segments/trackingInfo';
import { getOrderFeedbackTemplate } from './segments/orderFeedback';
import { contactUsTemplate } from './segments/contactUsTemplate';
import { generateEmailHead } from './segments/emailHead';
import { generateOrderItemsTable } from './segments/orderItemsTable';

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

  mjmlTemplate = mjmlTemplate + generateOrderItemsTable(data, `Included in this order:`);

  // Add footer
  mjmlTemplate = mjmlTemplate + getOrderFeedbackTemplate(data);
  mjmlTemplate = mjmlTemplate + contactUsTemplate;
  mjmlTemplate = mjmlTemplate + `
      </mj-body>
    </mjml>
  `

  return mjml2html(mjmlTemplate).html;
}
