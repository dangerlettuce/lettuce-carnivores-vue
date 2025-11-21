import type { PhotoItem } from "./Product"
export type PlantCategory = {
    name: string,
    genus: string,
    clone: string,
    speciesHybrid: '' | 'Species' | 'Hybrid',
    experience: '' | 'Beginner Friendly' | 'Intermediate' | 'Advanced',
    description: string,
    id: string,
    plants: Plant[],
    status: 'In Stock' | 'Coming Soon' | 'Archived' | 'Hidden' | 'Sold' | 'Delete',
    photos: PhotoItem[],
}

export type Plant = {
    id: string,
    sku: string,
    isRepresentative: boolean,
    size: PotSize,
    propagationDate?: string ,
    status:  'In Stock' | 'Coming Soon' | 'Archived' | 'Hidden' | 'Sold' | 'Delete',
    price: number,
    discountedPrice?: number,
    isDiscounted?: boolean,
    quantity: number,
    photos: PhotoItem[],
    plantCategoryId: string,
    shelfLocation: string,
    dateListedForSale?: Date | undefined | null
}
export interface PlantWithCategoryDetails extends Plant {
    name: string,
    genus: string,
    clone: string,
}
export type PotSize =
    '' |
    '2.5"' |
    '3" deep' |
    '3.5"' |
    '3.5" deep' |
    '4" deep' |
    '4.33" semi-round' |
    '4.5" deep' |
    '5" semi-round' |
    '5" deep' |
    'Bare Root' |
    'Bundle - 2 sm' |
    'Bundle - 3 sm' |
    'Bundle - 2 lg' |
    'Bundle - 3 lg' |
    'Snack Bag' |
    'Sandwich Bag' |
    'Quart Bag'
