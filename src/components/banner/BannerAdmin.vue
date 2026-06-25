<template>
	<div class="banner-admin">
		<label>
			Message
			<textarea rows="6" v-model="bannerDetails.message" />
		</label>
		<label>
			Link
			<input type="text" v-model="bannerDetails.link" />
		</label>
		<label>
			Style
			<select v-model="bannerDetails.style">
				<option value="default">Default</option>
				<option value="warning">Warning</option>
				<option value="info">Info</option>
				<option value="sale">Sale</option>
			</select>
		</label>
		<label>
			Show Banner
			<input type="checkbox" v-model="bannerDetails.showBanner" />
		</label>
		<BaseButton @click="handleSave()">Save</BaseButton>
	</div>
</template>

<script setup lang="ts">
	import { useBannerMessage } from '@/composables/useBannerMessage';
	import { onMounted } from 'vue';
	import { toast } from 'vue3-toastify';
	const { bannerDetails, getBannerDetails, saveBannerDetails } = useBannerMessage();


	onMounted(async () => {
		await getBannerDetails();
	});

	async function handleSave() {
		const result = await saveBannerDetails(bannerDetails.value);
		if (!result) {
			toast.error('Unable to save banner details');
		}
	}
</script>

<style scoped>
	.banner-admin {
		min-width: 700px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		align-items: center;
		justify-content: center;
		margin-block: 2rem;
	}

	label {
		text-align: center;
		margin-right: 8px;
		display: grid;
		grid-template-columns: 1fr 2fr;
		align-items: center;
	}

	input,
	select,
	textarea {
		width: 380px;
	}
</style>
