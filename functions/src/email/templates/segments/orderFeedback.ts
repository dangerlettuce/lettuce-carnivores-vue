import type { Order } from "../../../types/Orders";

export function getOrderFeedbackTemplate(data: Order) {
  return `
      <mj-section padding="0">
        <mj-column>
          <mj-divider border-color="#69b91d" padding="8px 0"></mj-divider>
          <mj-text font-size="16px"><h2 style="margin: 0; padding: 16px 0;">When it arrives, let us know how it went</h2></mj-text>
        </mj-column>
      </mj-section>
      <mj-section padding="0">

        <mj-column width="50%">
          <mj-button width="200px" href="https://dangerlettuce.com/feedback/${data.id}/great?email=${data.shippingInfo.email}" background-color="#69b91d" color="white">It was great!</mj-button>
        </mj-column>
        <mj-column width="50%">
            <mj-button width="200px" href="https://dangerlettuce.com/feedback/${data.id}?email=${data.shippingInfo.email}" background-color="#d64d21" color="white">It could have been better</mj-button>
        </mj-column>
      </mj-section>
  `
}