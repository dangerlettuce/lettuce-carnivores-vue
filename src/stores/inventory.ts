
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import type { AccessTokenDBResponse } from '@/types/Ebay'
import { addOrReplaceEbayInventory, deleteEbayItem, postOffer } from '@/composables/useEbayUtils'
import type { Plant, PlantCategory } from '@/types/Plant'
import type { InventoryRecord } from '@/types/Orders'
import { findAll } from '@/apis/dataServices'

export const useInventoryStore = defineStore('inventory', () => {
    const ebayTokenData: Ref<AccessTokenDBResponse | undefined> = ref(undefined)
    const isLoading: Ref<boolean> = ref(false)
    const inventoryItems: Ref<InventoryRecord[] | undefined> = ref(undefined)

    async function addUpdateEbayItem(plant: Plant, plantCategory: PlantCategory) {
        isLoading.value = true
        const res = await addOrReplaceEbayInventory(plantCategory, plant)
        isLoading.value = false

        if(res && 'success' in res && res.success) {
            return true
        }
        return false
    }

    async function listOnEbay(plantCategory: PlantCategory, plant: Plant) {
        isLoading.value = true
        const res = await postOffer(plantCategory, plant)
        isLoading.value = false
        if(res && 'success' in res && res.success) {
            inventorySkus.value.push(plant.sku)
            return true
        }
        return false
    }

    async function deleteItemFromEbay(sku: string) {
        const res = await deleteEbayItem(sku)
        const index = inventorySkus.value.indexOf(sku)
        inventorySkus.value.splice(index, 1)
        return res
    }

    const inventorySkus: Ref<string[]> = ref([])
    async function getUpdatedInventory() {
        if(inventoryItems.value === undefined) {
            const res = await findAll<InventoryRecord>('inventory', true)
            inventoryItems.value = res
            const activeItems = res.filter(item => item.active !== false && item.status !== 'error' && !item.error && item.listingId !== undefined)
            inventorySkus.value = activeItems.map(item => item.id)
        }
    }
    return {addUpdateEbayItem, listOnEbay, ebayTokenData, deleteItemFromEbay, getUpdatedInventory, inventoryItems, inventorySkus}
})
