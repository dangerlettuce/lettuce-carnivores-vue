import { formattedDate } from '@/utils/utils'
import {getShippingSize } from '@/composables/useShippingUtils'
import type { Plant, PlantCategory } from '@/types/Plant'
import type { InventoryItem } from '@/types/ebayApi/types'
import type { AppData, AppError } from '@/types/App'
import type { PhotoItem } from '@/types/Product'
import { getPhotoDownloadUrl } from '@/apis/fileServices'

export async function createEbayInventoryItem (plantCategory: PlantCategory, plant: Plant): Promise<AppData<InventoryItem> | AppError> {
    try {
        const inventoryItem: InventoryItem = {
            product: await buildProductDetails(plantCategory, plant),
            //condition: 'NEW',
            packageWeightAndSize: getShippingSize(plant.size),
            availability: {
                shipToLocationAvailability: {
                    quantity: plant.quantity
                }
            }
        }
        return {success: true, data: inventoryItem}
    }
    catch (e: any) {
        console.error(e)
        return {success: false, message: 'Unable to create inventory item', errorDetails: e }
    }

}

async function buildProductDetails(plantCategory: PlantCategory, plant: Plant): Promise<InventoryItem['product']> {
    const photoUrls = await getImageUrls(plant.photos)
    return {
        title: `${plantCategory.name} ${plantCategory.clone} - ${plant.size}`,
        description: createDescription(plantCategory, plant),
        imageUrls: photoUrls,
        aspects: buildAspects(plantCategory, plant) as any //ts-any: Ebay OpenApi 3 JSON currently (10/20/24) defines aspects as string, which is wrongo dongo.
                                                           // https://github.com/hendt/ebay-api/issues/181
    }

    function createDescription(plantCategory: PlantCategory, plant: Plant) {
        let text = ''
        text = `${plantCategory.name} - ${plant.size}<br>`
        if(plant.propagationDate) {
            text = text + `Division was taken on ${formattedDate(plant.propagationDate,'mm/dd/yy')}<br>`
        }
        text = text + `${plantCategory.description}`

        return text
    }

    async function getImageUrls(photos: PhotoItem[]) {
        let photoUrls = []
        if(photos.length > 0) {
            for(let photo of photos) {
                const url = await getPhotoDownloadUrl(photo)
                if(url) { photoUrls.push(url) }
            }
        }
        return photoUrls
    }
}

function buildAspects(plantCategory: PlantCategory, plant: Plant) {
    const aspects: {[key: string]: string[]} = {
        "Climate": ["Highland"],
        "Common Name": ["Pitcher Plant"],
        "Indoor/Outdoor": ["Indoor"],
        "Growth Habit": ["Clumping"],
        "California Prop 65 Warning": ["I don't have cancer yet, if that tells you anything"],
        "Brand": ["Danger Lettuce Carnivores"],
        "Type": ["Carnivorous Plants"],
        "Growth Stage": ["Mature"],
        "Watering": ["Heavy"],
        "Genus": [plantCategory.genus],
        "Number in Pack": ["1"],
        "Sunlight": [plantCategory.genus === 'Heliamphora' ? 'Medium Sun' : 'Medium Sun'],
    }
    if(plant.size !== 'Bare Root') {
        aspects["Features"] = ['Potted']
    }
    return aspects
}
