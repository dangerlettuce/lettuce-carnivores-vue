export type PlantCategory = {
    name: string,
    genus: string,
    clone: string,
    speciesHybrid: '' | 'Species' | 'Hybrid',
    experience: '' | 'Beginner Friendly' | 'Intermediate' | 'Advanced',
    description: string,
    id: string,
    plants: Plant[],
    status: 'In Stock' | 'Coming Soon' | 'Sold' | 'Archived' | 'Hidden',
    photos: PhotoItem[],
}

export type Plant = {
    id: string,
    sku: string,
    isRepresentative: boolean,
    size: PotSize,
    propagationDate?: Date,
    status:  'In Stock' | 'Coming Soon' | 'Sold' | 'Archived' | 'Hidden',
    price: number,
    discountedPrice?: number,
    isDiscounted: boolean,
    quantity: number,
    photos: PhotoItem[],
    plantCategoryId: string | number,
    shelfLocation?: string,
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
    'Bare Root'


type PhotoItem = {
    name: string,
    folder: string,
    originalFilename: string,
    path: string,
    date: Date,
}
