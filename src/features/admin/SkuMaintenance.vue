<template>
	<section>
		<div>
			<input name="sku" type="text" v-model="sku" />
		</div>

	</section>

</template>

<script setup lang="ts">

	const sku = defineModel();

</script>