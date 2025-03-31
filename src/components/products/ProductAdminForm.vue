<template>
  <section>
    <Collapsible v-model:open="categoryOpen">
      <header>
        <CollapsibleTrigger>
          <h2>Product Categories</h2>
        </CollapsibleTrigger>
        <div class="action-container">
          <BaseButton @click="addNewPlantCategory(1)" size="small">+ Plant Category</BaseButton>
          <BaseButton @click="addNewProductCategory(1)" size="small" type="info" color="">+ Product Category
          </BaseButton>
        </div>
      </header>
      <CollapsibleContent>
        <ProductAdminGrid />
      </CollapsibleContent>
    </Collapsible>
  </section>
</template>

<script setup lang="ts">
  import { ref, type Ref } from 'vue';
  import ProductAdminGrid from '@/components/ProductCategoryAdminGrid.vue';
  import Collapsible from '@/components/ui/collapsible/Collapsible.vue';
  import CollapsibleContent from '@/components/ui/collapsible/CollapsibleContent.vue';
  import CollapsibleTrigger from '@/components/ui/collapsible/CollapsibleTrigger.vue';
  import { useProductStore } from '@/stores/productStore'

  const categoryOpen = ref(true)
  const { addNewPlantCategory, addNewProductCategory } = useProductStore();


  //batch writes https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes

</script>

<style scoped>
  h2 {
    font-size: 1.5rem;
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-block: .5rem;

  }

  section {
    width: 80dvw;
  }

  .action-container {
    display: flex;
    gap: 1rem;
  }
</style>