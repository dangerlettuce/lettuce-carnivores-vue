<template>
  <section v-if="plantCategory" class="product-detail-section">
    <PhotoCarousel class="photo-section" :photos="photosToDisplay" />
    <article class="product-information">
      <h1>{{ plantCategory.name }}</h1>
      <h2 v-if="plantCategory.clone !== ''">Clone {{ plantCategory.clone }}</h2>
      <p class="description" :class="hideDescription ? '' : 'description-one-line'" @click="toggleHideDescription">
        {{ plantCategory.description }}
      </p>

      <div class="flex justify-evenly">
        <BaseButton v-for="plant in referencePlants" :key="plant.size" class="px-4"
          :type="selectedPlant?.sku == plant.sku ? 'primary' : 'secondary-outline'" @click="setSelectedPlant(plant)">
          {{`Representative - ${plant.size} `}}
        </BaseButton>
      </div>
      <div class="specimen-button-container">
        <BaseButton v-for="plant in specimenPlants" :key="plant.id" class="px-4 specimen-button"
          :type="selectedPlant?.sku === plant.sku ? 'primary' : 'secondary-outline'" @click="setSelectedPlant(plant)">
          {{ `Specimen ${plant.id} - ${plant.size}` }}
        </BaseButton>
      </div>
      <div v-if="daysSinceDivision && freshDivision?.isFreshDivision" class="mt-4">
        <p class="text-warning text-center">{{ freshDivision.message }}</p>
      </div>
      <div v-if="selectedPlant !== undefined" class="mt-4">
        <h2 class="mb-3">{{ plantTypeLabel }}</h2>
        <small>{{ plantTypeDescription }}</small>
      </div>
      <hr class="my-4" />
      <footer>
        <div class="content-center">
          <h2>{{ formattedPrice }}</h2>
        </div>
        <div v-if="availableForSale" class="flex flex-column justify-center">
          <BaseButton type="primary" class="mx-auto" @click="addToCart" :disabled="selectedPlant === undefined">Add to
            Cart</BaseButton>
        </div>
        <BaseButton v-else type="secondary" disabled>Out of Stock</BaseButton>
      </footer>
      <div v-show="selectedPlant === undefined" class="text-center text-warning mt-2">Please select a plant to add to
        cart</div>
      <div class="game-container" v-show="isGiveawayActive">
        <HalloweenGameCard />
      </div>
    </article>
  </section>
  <section v-else>
    <BaseSpinner />
  </section>

</template>

<script setup lang="ts">
  import { ref, onMounted, computed, type Ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { usePlantStore } from '@/stores/plant'
  import { useOrderStore } from '@/stores/order'
  import { toast } from 'vue3-toastify'
  import type { PlantCategory, Plant } from '@/types/Plant'
  import { formattedDate } from '@/utils/utils'
  import HalloweenGameCard from '@/components/giveaway/HalloweenGameCard.vue'
  import { storeToRefs } from 'pinia'
  import { useGiveawayStore } from '@/stores/giveaway'
  import PhotoCarousel from '../photo/PhotoCarousel.vue'
  const { isGiveawayActive } = storeToRefs(useGiveawayStore())

  const route = useRoute()
  const plantCategory: Ref<PlantCategory | undefined> = ref()
  const plants: Ref<Plant[]> = ref([])
  const showHidden = ref(false)
  const { addItemToCart } = useOrderStore()
  // const props = defineProps<{showHidden: boolean, required: false,}>()
  const { findPlantCategoryById, getAvailablePlants } = usePlantStore()

  onMounted(async () => {
    if ('showHidden' in route.query || 'showhidden' in route.query) { showHidden.value = true }
    await fetchData()
    plants.value = getAvailablePlants(plantCategory.value, showHidden.value)
    setSelectedPlant(plants.value[0])
    if (route.params.sku !== '') {
      const skuArr = plantCategory.value?.plants.map((plant) => plant.sku)
      if (skuArr && skuArr.includes(route.params.sku as string)) {
        setSelectedPlant(plantCategory.value?.plants.find((plant) => plant.sku === route.params.sku))
      }
    }
    const pageDescription = plantCategory.value?.description
    const pageTitle = `${plantCategory.value?.name}`
    document.title = pageTitle
    const descEle = document.querySelector('head meta[name="description"]')
    descEle?.setAttribute('content', pageDescription ?? `Mature ${pageTitle} divisions available for sale`)
  })

  const hideDescription = ref(true)

  function toggleHideDescription() {
    hideDescription.value = !hideDescription.value
  }

  const plantTypeLabel = computed(() => {
    if (selectedPlant.value === undefined) {
      return ''
    }
    return selectedPlant.value.isRepresentative ? 'Representative Plant' : 'Specimen Plant'
  })

  const plantTypeDescription = computed(() => {
    if (selectedPlant.value === undefined) {
      return ''
    }
    return selectedPlant.value.isRepresentative
      ? 'The photos show a plant or plants that are similar to the plant that you will receive. Often, you will receive one of the plants in the photo.'
      : 'The photos for this plant show the exact plant for sale. Note that old pitchers may be trimmed before shipping to ensure safe packaging.'
  })

  async function fetchData() {
    const productData = await findPlantCategoryById(Number(route.params.id))
    if (productData && productData !== undefined) {
      plantCategory.value = productData
    }
  }

  const selectedPlant: Ref<Plant | undefined> = ref()

  function setSelectedPlant(plant: Plant | undefined) {
    if (plant === undefined) {
      selectedPlant.value = undefined
      return
    } else {
      selectedPlant.value = plant
    }
  }

  const photosToDisplay = computed(() => {
    if (plantCategory.value !== undefined && selectedPlant.value === undefined) {
      if (plantCategory.value.photos.length > 0) {
        return plantCategory.value.photos
      } else if (plantCategory.value.plants.length > 0 && plantCategory.value.plants[0].photos.length > 0) {
        return plantCategory.value.plants[0].photos
      }
    }
    if (selectedPlant.value !== undefined && selectedPlant.value.photos.length > 0) {
      return selectedPlant.value.photos
    }
    return []
  })

  const referencePlants = computed(() => {
    return plants.value
      .filter((plant) => plant.isRepresentative)
      .sort(function (a, b) {
        const textA = a.size.toUpperCase()
        const textB = b.size.toUpperCase()
        return textA < textB ? -1 : textA > textB ? 1 : 0
      })
  })

  const specimenPlants = computed(() => {
    return plants.value
      .filter((plant) => !plant.isRepresentative)
      .sort(function (a, b) {
        const textA = a.id
        const textB = b.id
        return textA < textB ? -1 : textA > textB ? 1 : 0
      })
  })

  const formattedPrice = computed(() => {
    if (!selectedPlant.value || selectedPlant.value.price === 0 || !selectedPlant.value.price) {
      return '-'
    }
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    })
    return formatter.format(selectedPlant.value.price)
  })

  const availableForSale = computed(() => {
    return specimenPlants.value.length > 0 || referencePlants.value.length > 0
  })

  async function addToCart() {
    if (selectedPlant && selectedPlant.value && plantCategory && plantCategory.value) {
      const res = await addItemToCart({
        sku: selectedPlant.value.sku,
        id: selectedPlant.value.id,
        plantCategoryId: selectedPlant.value.plantCategoryId,
        price: selectedPlant.value.price,
        quantity: 1,
        maxQuantity: selectedPlant.value.quantity,
        categoryId: plantCategory.value.id,
        name: plantCategory.value.name,
        clone: plantCategory.value.clone,
        photo: selectedPlant.value.photos[0],
        size: selectedPlant.value.size,
        isRepresentative: selectedPlant.value.isRepresentative,
        shelfLocation: selectedPlant.value.shelfLocation,
        dateListedForSale: selectedPlant.value?.dateListedForSale,
      })

      if (res && res.success === true) {
        toast.success(res.message)
      } else {
        if (res && res.message) {
          toast.error(res.message)
        } else {
          toast.error('Unable to add to cart')
        }
      }
    }
  }

  const daysSinceDivision = computed(() => {
    if (!selectedPlant.value || !selectedPlant.value?.propagationDate) {
      return undefined
    }
    return Math.floor((Date.parse(new Date().toDateString()) - Date.parse(selectedPlant.value.propagationDate)) / 86400000)
  })
  const freshDivision = computed(() => {
    if (daysSinceDivision.value === undefined || !plantCategory.value || !selectedPlant.value?.propagationDate) {
      return { isFreshDivision: false, message: '' }
    }
    const formattedPropagationDate = formattedDate(selectedPlant.value.propagationDate)
    if (plantCategory.value.genus === 'Heliamphora') {
      return {
        isFreshDivision: daysSinceDivision.value < 45,
        message: `This is division was taken on ${formattedPropagationDate} and may not yet be rooted or established.
        We've had good success in shipping recent divisions and our live arrival guarantee does apply. However, un-rooted divisions need extra attention
        and therefore are not recommended for beginners. \nFresh divisions may be shipped bare-root, depending on the plant, to ensure the plant arrives safely.`,
      }
    }
    if (plantCategory.value.genus === 'Nepenthes') {
      return {
        isFreshDivision: daysSinceDivision.value < 14,
        message: `This is a freshly taken cutting, taken on ${formattedPropagationDate}, and is not rooted. In our experience, Nepenthes cuttings have a
            good success rate, but it definitely is not 100%. Our live arrival guarantee does apply, however we make no guarantees that this cutting will root.`,
      }
    }
  })
</script>

<style scoped>
  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  .product-detail-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 140rem;
  }

  .photo-section {
    display: flex;
    flex-direction: column;
    width: 90dvw;
  }

  .product-information {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 1rem;
    max-width: 30rem;
  }

  .description {
    margin-block: 1rem;
  }

  .specimen-button-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 0.5rem;
  }

  .specimen-button {
    flex-basis: 100%;
  }

  .description-one-line {
    max-width: 40ch;
    height: 1.5rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .game-container {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
  }

  footer {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  @media (min-width: 30rem) {
    .specimen-button {
      flex-basis: auto;
    }
  }

  @media (min-width: 50rem) {
    .photo-section {
      width: 40rem;
    }
  }

  @media (min-width: 60rem) {
    .product-detail-section {
      flex-direction: row;
    }

    .product-information {
      max-width: 25dvw;
      margin-left: 2rem;
    }

    .photo-section {
      width: 40rem;
    }

    .specimen-button {
      flex: 1 1 auto;
    }
  }

  @media(min-width: 80rem) {
    .photo-section {
      width: 75dvh;
    }

    .product-information {
      max-width: 35rem;
      margin-left: 2rem;
    }
  }

  @media (min-width: 100rem) {
    .photo-section {
      width: 75dvh;
    }
  }

</style>
