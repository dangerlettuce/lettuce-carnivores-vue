<template>
    <form class="plant-item-form">
        <FormKit
            type="text"
            label="ID"
            outer-class="min-size"
            validation="required"
            v-model="plant.id"
            @change="setRepresentative"
        />
        <FormKit
            type="text"
            label="SKU"
            v-model="plant.sku"
        />
        <FormKit
            type="select"
            label="Size"
            validation="required"

            :options="sizeList"
            v-model="plant.size"
        />
        <FormKit
            type="text"
            number
            label="Price"
            validation="required|number|min:0"
            outer-class="flex-1"
            v-model="plant.price"
        />
        <FormKit
            type="text"
            number
            label="Quantity"
            validation="required|number|min:0"
            outer-class="flex-1"
            v-model="plant.quantity"
        />
        <FormKit
            type="select"
            label="Status"
            validation-visibility="live"
            :options="statusListArr"
            v-model="plant.status"
        />
        <FormKit
            type="text"
            label="Shelf"
            outer-class="flex-1"
            v-model="plant.shelfLocation"
        />
        <FormKit
            type="date"
            label="Propagation Date"

            v-model="plant.propagationDate"
        />
        <div class="other-stuff">
            <FormKit
                type="checkbox"
                label="Representative"
                outer-class="flex-2 align-center"
                v-model="plant.isRepresentative"
            />
            <div>
                {{ `Photo: ${mostRecentPhoto}` }}
            </div>
        </div>

        <BaseButton @click.prevent="addPhotos" type="info">Photos <span>({{ plant.photos.length }})</span></BaseButton>
        <BaseButton v-if="plant.status === 'Delete'" type="danger" @click.prevent="$emit('deletePlant')" :disabled="plant.status !== 'Delete'">Delete</BaseButton>
        <BaseButton @click.prevent="$emit('createEbayItem')" :disabled="plant.status === 'Sold'">{{`${isListedOnEbay ? 'Update' : 'Create'} eBay Item`}}</BaseButton>
        <BaseButton @click.prevent="$emit('listEbayOffer')" :disabled="plant.status === 'Sold' || isListedOnEbay">List on eBay</BaseButton>
        <BaseButton @click.prevent="$emit('deleteEbayItem')" type="danger" :disabled="!isListedOnEbay">Delete from eBay</BaseButton>
        <div v-if="plant.soldNotes">{{ getSoldNotesDisplay(plant.soldNotes) }}</div>
    </form>
</template>

<script setup lang="ts">
import { computed, inject, watch, type PropType } from 'vue'
import { type Plant } from '@/types/Plant';
import { sizeList, statusListArr} from '@/constants/constants';
import { formatDate} from '@/utils/utils'

defineEmits(['triggerSave', 'deletePlant', 'createEbayItem', 'listEbayOffer', 'deleteEbayItem'])

const plant = defineModel('plant', {type: Object as PropType<Plant>, required: true})
const props = defineProps({
    inventorySkus: {type: Array<string>},
    showSoldArchived: {type: Boolean}
})

const isListedOnEbay = computed(() => {
    return props.inventorySkus?.includes(plant.value.sku)
})
watch(
    () => plant.value,
    () =>{
        if(!plant.value.status && !statusListArr.includes(plant.value.status)) {
            alert(`Plant ${plant.value.id}/${plant.value.sku} value for status does not match options in statusListArr `)
        }
        if(!plant.value.size && !statusListArr.includes(plant.value.status)) {
            alert(`Plant ${plant.value.id}/${plant.value.sku} value for status does not match options in statusListArr `)
        }
    },
    { immediate: true }
)



const managePhotos = inject<Function>('managePhotos')

function addPhotos() {
    if(managePhotos === undefined) { return }
    managePhotos('plants', plant.value.photos)
}

const mostRecentPhoto = computed(() => {
    const photoDates = plant.value.photos.map(photo => photo.date)
    if(photoDates.length > 0) {
        const mostRecentDate = photoDates.reduce((a, b) => {return a > b ? a : b})
        return formatDate(mostRecentDate)
    }
    return '-'
})
function setRepresentative() {
    plant.value.isRepresentative = plant.value.id === '';
}

watch(() => plant.value.id, () => {
    if(plant.value.sku === '' && plant.value.id.toString().length === 4) {
        plant.value.sku = plant.value.id.toString()
    }
})

function getSoldNotesDisplay(notes: string) {
    if(notes.length < 10 ) return notes;
    const orderPosition = notes.indexOf('Order');
    return `Sold: ${notes.slice(orderPosition, orderPosition + 10)}`;
}

</script>

<style scoped>

    .plant-item-form {
        width: 90%;
        margin: .25rem 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16ch, 1fr));
        gap: .4rem;
        align-items: center;
    }

    .min-size {
        min-width: 8ch;
    }
    
    .flex-1 {
        display: flex;
        flex: 1;
    }
    .flex-2 {
        display: flex;
        flex: 2;
    }
    .other-stuff {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin: .1rem 0;
        gap: .25rem;
    }

</style>
