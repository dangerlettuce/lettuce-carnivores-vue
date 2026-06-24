<template>
  <GiveawayAdminForm />
  <div>
    <BaseButton @click="showEntries = !showEntries">Show Entries</BaseButton>
    <GiveawayEntriesList v-if="showEntries" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import GiveawayAdminForm from './GiveawayAdminForm.vue';
import GiveawayEntriesList from '@/components/giveaway/GiveawayEntriesList.vue';

const showEntries = ref(false);
</script>
