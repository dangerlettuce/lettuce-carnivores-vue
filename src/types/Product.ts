export interface ProductCategory {
    id: string,
    category: 'Plants' | 'Supplies' | '',
    subCategory: string,
    name: string,
    description: string,
    status: ProductStatus,
    photos: Array<PhotoItem>,
    tags: string[],
    createdDate: Date,
    dateUpdated: Date,
}
export interface PlantCategory extends ProductCategory {
    category: 'Plants',
    speciesHybrid: '' | 'Species' | 'Hybrid',
    source: string,
    genus: string,
    clone: string,
}

export interface Product {
    sku: string,
    quantity: number | null,
    productCategoryId: string | null,
    price: number | null,
    status: ProductStatus,
    photos: Array<PhotoItem>,
    createdDate: Date,
    updatedDate: Date,
}

export interface ExtendedProduct extends Product {
    categoryInfo: ProductCategory
}

export interface Plant extends Product {
    plantInfo: {
        size: string,
        propagationDate: Date | string | null,
        ageGroup: string,
        isSpecimen: boolean,
        shelfLocation: string,
    }
}

export interface ExtendedPlant extends Plant {
    categoryData: PlantCategory
}

type ProductStatus = 'Active' | 'Inactive' | 'Hidden' | 'Archived'

export type PotSize =
    '' |
    '2.5"' |
    '3" deep' |
    '3.5"' |
    '3.5" deep' |
    '4.33" semi-round' |
    '4" deep' |
    '4.5" deep' |
    '5" semi-round' |
    '5" deep' |
    'Bare Root' |
    'Specimen' |
    'Bundle - 2 sm' |
    'Bundle - 3 sm' |
    'Bundle - 2 lg' |
    'Bundle - 3 lg' |
    'Snack Bag' |
    'Sandwich Bag' |
    'Quart Bag'
// Product Category:
//   - type: plant, supply
//     - category: Heli, Nep, pots, fertilizer, growingMedia

// Sort
//   - Name(alpha)
//   - Price($ - $$$)(calc - SKUs)
//   - Best Selling
//     - Date Updated(calc - SKUs)

// Filters
//   - By Product Type
//     - Product Type Specific Filters
//       - Plant
//       - Genus
//       - Experience
//       - Age(Fresh division, Recent division, Established divisions, Specimen, Immature)


export type PhotoItem = {
    name: string,
    folder: string,
    originalFilename: string,
    path: string,
    date: Date,
    resolutions: number[],
}

export type ProductFilters = {
    [key: string]: any
}

export type PhotoSizes = 256 | 512 | 960 | 1600
