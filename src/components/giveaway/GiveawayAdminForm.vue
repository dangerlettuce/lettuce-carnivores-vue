<template>
  <div class="form-container">
    <FormKit type="form" submit-label="Create Giveaway" id="giveaway-admin" @submit="addGiveaway">
      <FormKit type="checkbox" name="active" label="Active" outer-class="mb-2" placeholder="" v-model="formData.active" />
      <FormKit type="text" name="name" label="Name" validation="required" v-model="formData.name" />
      <FormKit type="text" name="description" label="Description" validation="required" v-model="formData.description" />
      <FormKit type="text" name="duration" label="Duration" validation="required" v-model="formData.duration" />
      <FormKit type="text" name="prize" label="Prize" validation="required" v-model="formData.prize" />
      <FormKit type="number" number name="prizeValue" label="Prize Value" validation="required" v-model="formData.prizeValue" />
      <FormKit type="text" name="summary" label="Summary" validation="required" v-model="formData.summary" />

      <FormKit type="text" name="password" label="Game Password" validation="required" v-model="formData.gameData.password" />
      <FormKit type="datetime-local" name="giveawayStartTime" label="Start Time" validation="required" v-model="startTime" />
      <FormKit type="datetime-local" name="giveawayEndTime" label="End Time" validation="required" v-model="endTime" />
      <FormKit type="text" name="winnerAnnounced" label="Winner Announced" validation="required" v-model="formData.winnerAnnounced" />
    </FormKit>

    <div>
      <label for="copyFrom">Copy From Previous Giveaway Name:</label>
      <input id="copyFrom" type="text" v-model="copyFrom" />
      <BaseButton @click="fetchPrevious">Get Previous</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import { FormKit } from '@formkit/vue';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/apis/firebase';
import type { Giveaway } from '@/types/Giveaway';
import BaseButton from '../ui/BaseButton.vue';
import { findDocById } from '@/apis/dataServices';

const collectionName = 'giveaways';
const now = new Date();
const endTime = ref();
const startTime = ref();

const formattedStartTime = computed(() => {
  return startTime.value.toISOString().substring(0, 16);
});
const formattedEndTime = computed(() => {
  return endTime.value.toISOString().substring(0, 16);
});
const formData: Ref<Giveaway> = ref({
  active: false,
  name: '',
  description: '',
  duration: '',
  gameData: {
    password: '',
  },
  giveawayEndTime: formattedEndTime,
  giveawayStartTime: formattedStartTime,
  prize: '',
  prizeValue: 0,
  summary: '',
  winnerAnnounced: '',
});

async function addGiveaway() {
  const res = await setDoc(doc(db, collectionName, formData.value.name), { ...formData.value });
}

const copyFrom = ref('');
async function fetchPrevious() {
  const oldDoc = await findDocById(collectionName, copyFrom.value.toString());
  if (oldDoc) {
    formData.value = oldDoc as Giveaway;
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 50rem;
}
</style>
