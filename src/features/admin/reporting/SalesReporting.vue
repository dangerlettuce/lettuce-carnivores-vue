<template>
	<div class="sales-reporting">
		<div class="header-row">
			<h2>Sales Reporting</h2>
			<div class="actions">
				<button class="refresh-button" type="button" @click="fetchSalesRows">Refresh</button>
				<button class="export-button" type="button" @click="exportCsv">Export CSV</button>
			</div>
		</div>

		<BaseGrid
			ref="gridRef"
			id="sales-report-grid"
			class="sales-grid"
			:rowData="rowData"
			:columnDefs="columnDefs"
			:defaultColumnDefs="defaultColDef"
			:style="'height: 52dvh; width: 100%;'"
			:theme="themeBalham"
			:isLoading="isLoading"
			:gridOptions="gridOptions" />
	</div>
</template>

<script setup lang="ts">
	import { onMounted, ref } from 'vue';
	import { themeBalham, type ColDef, type GridApi } from 'ag-grid-community';
	import { collection, getDocs, Timestamp } from 'firebase/firestore';
	import { db } from '@/apis/firebase';
	import BaseGrid from '@/components/BaseGrid.vue';
	import type { Order } from '@/types/Orders';

	type SalesReportMetadata = {
		categoryId?: number;
		sku?: string;
		clone?: string;
		size?: string;
		isRepresentative?: boolean;
		shelfLocation?: string;
		dateListedForSale?: Date | string | Timestamp | null;
		propagationDate?: Date | string | Timestamp | null;
	};

	type SalesReportRow = {
		sku: string;
		unit_amount: number;
		price: number;
		size: string;
		name: string;
		dateListedForSale: string;
		daysToSell: number | null;
		propagationDate: string;
		daysSincePropagation: number | null;
		orderDate: string;
		totalSale: number;
		orderNumber: number | string;
	};

	const isLoading = ref(false);
	const rowData = ref<SalesReportRow[]>([]);
	const gridRef = ref<{ gridApi: GridApi | null } | null>(null);
	const gridOptions = {
		defaultColDef: { flex: 1 },
	};

	const defaultColDef = {
		resizable: true,
		sortable: true,
		filter: true,
		minWidth: 120,
		flex: 1,
	};

	const columnDefs: ColDef<SalesReportRow>[] = [
		{ headerName: 'SKU', field: 'sku', minWidth: 160 },
		{
			headerName: 'Price',
			field: 'price',
			valueFormatter: (params) => formatCurrency(params.value),
			minWidth: 150,
		},
		{
			headerName: 'Unit Amount',
			field: 'unit_amount',
			valueFormatter: (params) => formatCurrency(params.value),
			minWidth: 150,
		},
		{ headerName: 'Size', field: 'size', minWidth: 120 },
		{ headerName: 'Name', field: 'name', minWidth: 200 },
		{
			headerName: 'Date Listed',
			field: 'dateListedForSale',
			minWidth: 150,
		},
		{
			headerName: 'Days To Sell',
			field: 'daysToSell',
			valueFormatter: (params) => (params.value == null ? '—' : `${params.value} days`),
			minWidth: 120,
		},
		{
			headerName: 'Propagation Date',
			field: 'propagationDate',
			minWidth: 150,
		},
		{
			headerName: 'Days Since Propagation',
			field: 'daysSincePropagation',
			valueFormatter: (params) => (params.value == null ? '—' : `${params.value} days`),
			minWidth: 160,
		},
		{
			headerName: 'Order Date',
			field: 'orderDate',
			valueFormatter: (params) => params.value ?? '—',
			minWidth: 150,
		},
		{
			headerName: 'Total Sale',
			field: 'totalSale',
			valueFormatter: (params) => formatCurrency(params.value),
			minWidth: 150,
		},
		{ headerName: 'Order Number', field: 'orderNumber', minWidth: 140 },
	];

	const formatCurrency = (value: number | null | undefined) => {
		if (typeof value !== 'number' || Number.isNaN(value)) {
			return '$0.00';
		}

		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(value / 100);
	};

	const parseDateValue = (value: unknown): Date | null => {
		if (!value) return null;
		if (value instanceof Date) return value;
		if (typeof value === 'string') {
			const parsed = new Date(value);
			return Number.isNaN(parsed.getTime()) ? null : parsed;
		}
		if (value instanceof Timestamp) return value.toDate();
		if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
			return (value as { toDate: () => Date }).toDate();
		}
		return null;
	};

	const formatFirestoreDate = (value: unknown) => {
		const date = parseDateValue(value);
		if (!date) return '—';
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	};

	const calculateDaysDifference = (start: unknown, end: unknown) => {
		const startDate = parseDateValue(start);
		const endDate = parseDateValue(end);
		if (!startDate || !endDate) return null;
		const diffMs = endDate.getTime() - startDate.getTime();
		return Math.round(diffMs / 86400000);
	};

	const normalizeSalesRows = (orders: Order[]): SalesReportRow[] =>
		orders.flatMap((order) => {
			const orderNumber = order.id ?? order.checkoutSessionId ?? 'Unknown';
			const saleDate = parseDateValue(order.orderDate) ?? new Date();
			const orderDate = formatFirestoreDate(order.orderDate);
			const totalSale = Number(order.cartTotal?.amountTotal ?? 0);

			return (order.lineItems ?? []).map((lineItem) => {
				const metadata = (((lineItem as any)?.price_data?.product_data?.metadata ?? {}) as SalesReportMetadata) || {};
				const itemName = lineItem?.price_data?.product_data?.name ?? '';
				const unitAmount = Number(lineItem?.price_data?.unit_amount ?? 0);
				const dateListedForSale = metadata.dateListedForSale ?? null;
				const propagationDateValue = metadata.propagationDate ?? null;
				const daysToSell = calculateDaysDifference(dateListedForSale, saleDate);
				const daysSincePropagation = calculateDaysDifference(propagationDateValue, saleDate);

				return {
					sku: String(metadata.sku ?? ''),
					unit_amount: unitAmount,
					price: unitAmount,
					size: String(metadata.size ?? ''),
					name: String(itemName),
					dateListedForSale: formatFirestoreDate(dateListedForSale),
					daysToSell,
					propagationDate: formatFirestoreDate(propagationDateValue),
					daysSincePropagation,
					orderDate,
					totalSale,
					orderNumber,
				};
			});
		});

	async function fetchSalesRows() {
		isLoading.value = true;

		try {
			const snapshot = await getDocs(collection(db, 'orders'));
			const orders = snapshot.docs.map((doc) => ({ ...doc.data(), id: Number(doc.id) }) as Order);
			rowData.value = normalizeSalesRows(orders);
		} catch (error) {
			console.error('Failed to fetch sales orders:', error);
			rowData.value = [];
		} finally {
			isLoading.value = false;
		}
	}

	function exportCsv() {
		const api = gridRef.value?.gridApi;
		if (!api) {
			return;
		}

		api.exportDataAsCsv({
			fileName: `sales-report-${new Date().toISOString().slice(0, 10)}.csv`,
		});
	}

	onMounted(() => {
		void fetchSalesRows();
	});
</script>

<style scoped>
	.sales-reporting {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 1200px;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
	}

	.refresh-button,
	.export-button {
		border: 1px solid #cbd5e1;
		border-radius: 0.5rem;
		background: white;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
	}

	.export-button {
		background: #0f172a;
		color: white;
		border-color: #0f172a;
	}

	.sales-grid {
		width: 100%;
		min-height: 420px;
	}

	.loading-state {
		padding: 1rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		background: #f8fafc;
	}
</style>
