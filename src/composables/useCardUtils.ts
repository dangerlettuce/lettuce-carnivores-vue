import { type PlantCategory, type Plant} from "@/types/Plant"

export function getCardName(category: PlantCategory) {
    if(category.clone === undefined || !category.clone || category.clone === '') {
        return category.name
    } else {
        return `${category.name} - ${category.clone}`
    }
}
export function getDisplayPrice(category: PlantCategory, availablePlants: Plant[]) {

    if(availablePlants.length === 0) {return ''}

    const min = Math.min(...availablePlants.map(category => category.price))
    const max = Math.max(...availablePlants.map(category => category.price))
    return min === max ? min : `$${min} - ${max}`
}

export function getCardPhoto(category: PlantCategory) {
    if(category.photos.length !== 0) {
        return category.photos[0].path
    }
    if(category.plants.length !== 0) {
        let plantPath: undefined | string = undefined
        category.plants.forEach(plant => {
            if(plantPath === undefined && plant.photos.length !== 0 && plant.status === 'In Stock') {
                plantPath = plant.photos[0].path
            }
        });
        return plantPath
    }

}