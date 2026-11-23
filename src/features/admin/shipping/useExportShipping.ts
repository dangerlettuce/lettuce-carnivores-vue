import type { Order } from "@/types/Orders";

function getEligibleOrdersForExport(orders: Order[]): Order[] {
	return orders.filter((order) => {
		return order.orderStatus.status === "Processing" && order.shippingInfo.package.length !== null && order.shippingInfo.package.weight !== null;
	});
}

function getHeaderCSV(): string {
	const header = [
		"Order ID",
		"Name",
		"Address Line 1",
		"Address Line 2",
		"City",
		"State",
		"Postal Code",
		"Length",
		"Width",
		"Height",
		"Weight",
		"Weight Unit",
		"Shipping Type",
		"Tracking Number",
		"Status"
	];
	return header.join(",");
}

function getRowCSV(order: Order): string {
	const row = [
		order.id,
		order.shippingInfo.name,
		order.shippingInfo.address.line1,
		order.shippingInfo.address.line2,
		order.shippingInfo.address.city,
		order.shippingInfo.address.state,
		order.shippingInfo.address.postal_code,
		order.shippingInfo.package.length,
		order.shippingInfo.package.width,
		order.shippingInfo.package.height,
		order.shippingInfo.package.weight,
		order.shippingInfo.package.weight_unit,
		order.shippingInfo.shippingType,
		order.orderStatus.trackingNumber || "",
		order.orderStatus.status
	];
	return row.join(",");
}

function downloadCSV(csvContent: string, filename: string) {
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function useExportShipping() {
	/**
	 * Exports a spreadsheet of shipping info for open orders that can be used to print shipping labels.
	 */
	async function exportShipping(orders: Order[]) {
		const eligibleOrders = getEligibleOrdersForExport(orders);
		if (eligibleOrders.length === 0) {
			alert("No orders are eligible for export.");
			return;
		}

		const csvContent = [getHeaderCSV(), ...eligibleOrders.map(getRowCSV)].join("\n");

		downloadCSV(csvContent, `shipping_${new Date().toISOString()}.csv`);
	}
	return { exportShipping };
}