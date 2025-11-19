import mjml2html from 'mjml';
import type { Order } from '../types/Orders';

export function generateOrderStatusUpdateTemplate(data: Order) {
  if (data.lineItems.length === 0 || !data.orderStatus.status || !data.id || !data.orderStatus.carrier || !data.orderStatus.trackingNumber ) {
    console.error(`Missing or invalid data. Unable to generate email template`)
    console.log(data);
    return null;
  }
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

  let trackingUrl = '';
  switch(data.orderStatus.carrier.toLocaleLowerCase()) {
    case 'ups':
      trackingUrl = `https://www.ups.com/track?TypeOfInquiryNumber=T&InquiryNumber1=${data.orderStatus.trackingNumber}}`
      break;
    case 'usps':
      trackingUrl = `https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=${data.orderStatus.trackingNumber}`;
      break;
    case 'fedex':
      trackingUrl = `https://www.fedex.com/apps/fedextrack?trknbr=${data.orderStatus.trackingNumber}`;
      break;
    default:
      console.error(`Invalid carrier ${data.orderStatus.carrier}. Unable to generate email template`)
      return null;
  }

  // Add head and tracking info
  let mjmlTemplate = `
    <mjml>
      <mj-head>
      </mj-head>
      <mj-body>
        
        <mj-section>
          <mj-column  vertical-align="middle">
            <mj-image width="250px" src="https://firebasestorage.googleapis.com/v0/b/lettuce-carnivores.appspot.com/o/site%2Fmain%20%2B%20bug%20366x200.png?alt=media&token=43adc7eb-37d0-4e60-b2b3-9fa2a26bfd79"></mj-image>
          </mj-column>
          <mj-column vertical-align="middle">
            <mj-image width="300px" src="https://firebasestorage.googleapis.com/v0/b/lettuce-carnivores.appspot.com/o/site%2Ftext%20only-650x200.png?alt=media&token=6fb2883d-7c35-4839-9f5c-83ba2dc0a511"></mj-image>
          </mj-column>
        </mj-section>
        <mj-section>
        <mj-column>
          <mj-text font-size="20px"><h1>Order ${data.id} ${statusMessage}</h1></mj-text>
          <mj-text font-size="16px">{{carrier}} ${data.orderStatus.trackingNumber}</mj-text>
          <mj-button href="${trackingUrl}" background-color="#69b91d" color="white">Track your order</mj-button>
          <mj-divider border-color="#69b91d" padding-top="24px"></mj-divider>
        </mj-column>  
      </mj-section>
  `

  // Start of item list
  mjmlTemplate += `
      <mj-section padding="0">
        <mj-column>
          <mj-text font-size="16px"><h2 style="margin: 0">Included in this order:</h2></mj-text>
            <mj-table>
              

  `
  // Add cart items
  data.lineItems.forEach(item => {
    mjmlTemplate += `
      <tr style="border-bottom:1px dashed lightgrey;">
        <td align="left">
          <p style="font-size: 14px; padding: 10 0 0 0; margin: 0px">${item.price_data.product_data.name}</p>
          <p style="font-size: 12px; padding: 4px 0px; margin: 0px">${item.price_data.product_data.metadata.size}</p>
          <p style="font-size: 12px; padding: 0 0 10 0; margin: 0px">SKU: ${item.price_data.product_data.metadata.sku}</p>
        </td>
        <td align="center">${item.quantity}</td>
        <td align="right">${item.price_data.unit_amount}</td>
      </tr>
    `
  })

  // Add shipping/tax/total
  mjmlTemplate += `
              <tr style="border-bottom:1px dashed lightgrey;">
                <td align="left">Shipping</td>
                <td align="center"></td>
                <td align="right">{{Price}}</td>
              </tr>
              <tr style="border-bottom:1px dashed lightgrey;">
                <td align="left">Tax</td>
                <td align="center"></td>
                <td align="right">{{Price}}</td>
              </tr>
              <tr style="border-bottom:1px dashed lightgrey;">
                <td align="left" style="font-weight:bold;">Total</td>
                <td align="center"></td>
                <td align="right" style="font-weight:bold;">{{Price}}</td>
              </tr>
          
            </mj-table>

        </mj-column>

      </mj-section>
`
// Add footer
mjmlTemplate += `
      <mj-section padding="0">
        <mj-column>
          <mj-divider border-color="#69b91d" padding="8px 0"></mj-divider>
          <mj-text font-size="16px"><h2 style="margin: 0; padding: 16px 0;">When it arrives, let us know how it went</h2></mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="0">

        <mj-column width="50%">
          <mj-button width="200px" href="https://dangerlettuce.com/feedback?order_number=${data.id}&great" background-color="#69b91d" color="white">It was great!</mj-button>
        </mj-column>
        <mj-column width="50%">
            <mj-button width="200px" href="https://dangerlettuce.com/feedback?order_number=${data.id}" background-color="#d64d21" color="white">It could have been better</mj-button>
        </mj-column>
      </mj-section>
      
      <mj-section>
        <mj-column>
            <mj-text font-size="16px"><h2 style="margin: 0; padding: 8px 0;">Have a question or need to get in contact?</h2></mj-text>
            <mj-button background-color="#2989b3" href="https://ig.me/m/dangerlettuce">Send us a message on Instagram</mj-button>
            <mj-text align="center" padding="0"><p>or simply reply to this email.</p></mj-text>
        </mj-column>
      </mj-section>
      
    </mj-body>
  </mjml>
  `

  return mjml2html(mjmlTemplate).html;
}


