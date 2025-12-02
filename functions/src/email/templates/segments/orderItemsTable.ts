import type { Order } from "../../../types/Orders";
import { formatPrice } from "../../../common";
import { debug, error } from "firebase-functions/logger";
export function generateOrderItemsTable(data: Order, title: string) {
	if (!title || !data || 'lineItems' in data === false || data.lineItems.length === 0) {
		error(`Invalid data, unable to generate orderItemsTable template for email`)
		debug(title, data, data.lineItems);
		return '';
	}
	
	let mjmlTemplate = '';
	mjmlTemplate = mjmlTemplate + `
		<mj-section padding="0">
			<mj-column>
			<mj-text font-size="16px"><h2 style="margin: 0">${title}</h2></mj-text>
			<mj-table>
	`
		
		// Add cart items
		data.lineItems.forEach(item => {
		mjmlTemplate = mjmlTemplate + `
			<tr style="border-bottom:1px dashed lightgrey;">
			<td align="left">
				<p style="font-size: 14px; padding: 10 0 0 0; margin: 0px">${item.price_data.product_data.name}</p>
				<p style="font-size: 12px; padding: 4px 0px; margin: 0px">Size: ${item.price_data.product_data.metadata.size}</p>
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
		`
		// Close Included in this order table
		mjmlTemplate = mjmlTemplate + `            
				</mj-table>
			</mj-column>
			</mj-section>
		`
	return mjmlTemplate;
}