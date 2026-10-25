import type { Order } from '@/types/Orders';
import { useStorage } from '@vueuse/core';

type LineItem = Order['lineItems'][number];

export function useOrderPickList() {
	const checkedItems = useStorage<Record<string, boolean>>('order-pick-list-checked-items', {});

	function getLineItemLabel(item: LineItem) {
		return `${item.price_data.product_data.metadata.sku} - ${item.price_data.product_data.name} - ${item.price_data.product_data.metadata.size}`;
	}

	function getLineItemId(orderId: string | number, item: LineItem, index: number) {
		const { sku, size } = item.price_data.product_data.metadata;
		return `${orderId}-${sku}-${size}-${index}`;
	}

	function isLineItemChecked(orderId: string | number, item: LineItem, index: number) {
		return Boolean(checkedItems.value[getLineItemId(orderId, item, index)]);
	}

	function onLineItemCheckedChange(event: Event, orderId: string | number, item: LineItem, index: number) {
		const checked = (event.target as HTMLInputElement).checked;
		const id = getLineItemId(orderId, item, index);
		checkedItems.value = {
			...checkedItems.value,
			[id]: checked,
		};
	}

	return {
		getLineItemLabel,
		getLineItemId,
		isLineItemChecked,
		onLineItemCheckedChange,
	};
}
