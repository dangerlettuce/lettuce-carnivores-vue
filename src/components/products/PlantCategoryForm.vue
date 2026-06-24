<template>
  <Formkit type="form" @submit.prevent class="plant-admin-form">
    <FormKit
      type="text"
      label="ID"
      number
      validation="required|number"
      validation-visibility="blur"
      class="grid-col-1"
      v-model="plantCategoryToEdit.id"
    />
    <FormKit type="text" label="Name" outer-class="grid-col-2" v-model="plantCategoryToEdit.name" />
    <FormKit type="select" label="Genus" :options="genusListArr" class="grid-col-1" v-model="plantCategoryToEdit.genus" />
    <FormKit type="text" label="Clone" class="grid-col-1" v-model="plantCategoryToEdit.clone" />
    <FormKit
      type="select"
      label="Species/Hybrid"
      class="grid-col-1"
      :options="speciesHybridArr"
      v-model="plantCategoryToEdit.speciesHybrid"
    />
    <FormKit type="select" label="Experience" :options="experienceList" class="grid-col-1" v-model="plantCategoryToEdit.experience" />
    <FormKit type="select" label="Status" :options="statusListArr" class="grid-col-1" v-model="plantCategoryToEdit.status" />
    <FormKit
      type="textarea"
      label="Description"
      outer-class="description"
      rows="4"
      style="height: auto; width: 90%; border-radius: 0.75rem"
      v-model="plantCategoryToEdit.description"
    />
  </Formkit>
  <section class="form-actions">
    <BaseButton
      type="danger"
      @click.prevent="deleteProduct"
      :disabled="!plantCategoryToEdit.id || plantCategoryToEdit.status !== 'Archived'"
    >
      Delete Plant<span class="spinner-border" role="status" v-if="isSaving"></span>
    </BaseButton>
    <BaseButton type="secondary" @click.prevent="setCategoryToEdit(null)"> Reset Form </BaseButton>
    <BaseButton type="info" @click.prevent="addPhotos">
      Photos <span>({{ plantCategoryToEdit.photos.length }})</span>
    </BaseButton>
    <BaseButton type="primary" @click.prevent="saveCategory(plantCategoryToEdit)" :disabled="isSaving">
      Save<span class="spinner-border" role="status" v-if="isSaving"></span>
    </BaseButton>
  </section>
</template>

<script setup lang="ts">
import { ref, inject, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { usePlantStore } from '@/stores/plant';
import { storeToRefs } from 'pinia';
import { genusListArr, statusListArr, speciesHybridArr, experienceList } from '@/constants/constants';

const { saveCategory, setCategoryToEdit, deleteCategoryById } = usePlantStore();
const { plantCategoryToEdit, isSaving } = storeToRefs(usePlantStore());

watch(
  () => plantCategoryToEdit.value,
  () => {
    if (!plantCategoryToEdit.value.status && !statusListArr.includes(plantCategoryToEdit.value.status)) {
      alert('Value for status does not match options in   statusListArr ');
    }
  },
);

async function deleteProduct() {
  if (plantCategoryToEdit.value.id) {
    const res = await deleteCategoryById(plantCategoryToEdit.value.id).catch((err) => console.error(err));
    if (res && res.success) {
      toast.success(res.message);
    } else {
      if (res && res.message) {
        toast.error(res.message);
      }
    }
  }
}

const managePhotos = inject<Function>('managePhotos');

function addPhotos() {
  if (managePhotos === undefined) {
    return;
  }
  managePhotos('plantCategories', plantCategoryToEdit.value.photos);
}
</script>

<style scoped>
.plant-admin-form {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 95%;
  margin: 2rem 0;
  gap: 0.5rem;
}

.form-action {
  min-width: 7rem;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-evenly;
  margin-bottom: 0.5rem;
  gap: 0.5em;
}

.spinner-border {
  height: 1rem;
  width: 1rem;
  margin-left: 1rem;
}

@media (min-width: 45rem) {
  .plant-admin-form {
    grid-template-columns: repeat(3, 1fr);
  }

  .description {
    grid-column: span 3;
  }

  .form-actions {
    flex-wrap: nowrap;
  }
}

@media (min-width: 120rem) {
  .plant-admin-form {
    grid-template-columns: repeat(10, 1fr);
  }
}
</style>
