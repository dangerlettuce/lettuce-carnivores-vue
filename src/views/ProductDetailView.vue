<template>
  <ProductDetails :key="route.params.id.toString()" />
</template>

<script setup lang="ts">
import ProductDetails from '@/components/products/ProductDetails.vue';
import { useRoute } from 'vue-router';
const route = useRoute();
</script>
