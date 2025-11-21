import type { PlantCategory, Plant } from "@/types/Plant"
import type { PhotoItem } from "@/types/Product"

export const productCategoryList = ['Plants', 'Supplies']
export const productStatusList = ['Active', 'Inactive', 'Hidden', 'Archived']

export const subCategories = new Map([
    ['Plants', ['Heliamphora', 'Nepenthes', 'Cephalotus', 'Other']],
    ['Supplies', ['Fertilizer', 'Tools', 'Other']]
])


export const photoResolutions = [256,512,960,1600]
export const sizeList = [
    {label: '', value: '',},
    {label: '2.5"', value: '2.5"'},
    {label: '3" deep', value: '3" deep'},
    {label: '3.5"', value: '3.5"'},
    {label: '3.5" deep', value:'3.5" deep'},
    {label: '4" deep', value: '4" deep'},
    {label: '4.33" semi-round', value: '4.33" semi-round'},
    {label: '4.5" deep', value: '4.5" deep'},
    {label: '5" semi-round', value: '5" semi-round'},
    {label: '5" deep', value: '5" deep'},
    { label: 'Bare Root', value: 'Bare Root' },
    { label: 'Snack Bag', value: 'Snack Bag' },
    { label: 'Sandwich Bag', value: 'Sandwich Bag' },
    { label: 'Quart Bag', value: 'Quart Bag' },
]

export const genusListArr = ['', 'Heliamphora', 'Nepenthes', 'Cephalotus', 'Other']
export const statusListArr = ['', 'In Stock', 'Coming Soon', 'Archived', 'Hidden', 'Sold', 'Delete']
export const experienceList = ['', 'Beginner Friendly', 'Intermediate', 'Advanced']
export const speciesHybridArr = ['', 'Species', 'Hybrid']
export const otherFiltersList = [
    {label: 'Species', value: 'Species', hidden: false},
    {label: 'Hybrid', value: 'Hybrid', hidden: false},
    {label: 'Specimen', value: 'Specimen', hidden: false},
    {label: 'Representative', value: 'Representative', hidden: false},
    {label: 'Only Sale Items', value: 'Only Sale Items', hidden: false},
]
export const genusList = [
    {label:'', value: false, hidden: true},
    {label:'Heliamphora', value: 'Heliamphora', hidden: false},
    {label:'Nepenthes', value: 'Nepenthes', hidden: false},
    {label:'Cephalotus', value: 'Cephalotus', hidden: false},
    {label:'Other', value: 'Other', hidden: false},
]
export const statusList = [
    {label:'', value: false, hidden: true},
    {label:'In Stock', value: 'In Stock', hidden: false},
    {label:'Coming Soon', value: 'Coming Soon', hidden: false},
    {label:'Archived', value: false, hidden: true},
    {label:'Hidden', value: false, hidden: true},
    {label:'Sold', value: false, hidden: true}
]
export const defaultFilters = {
    genus: {
        label: 'Genus',
        filterKey: 'genus',
        items: genusList.filter(item => !item.hidden)
    },
    status: {
        label: 'Availability',
        filterKey: 'status',
        items: [
            {label:'In Stock', value: 'In Stock', hidden: false},
        ]
    },
    experience: {
        label: 'Experience',
        items: experienceList.filter(item => item !== '')
    },
    other: {
        label: 'Other Filters',
        items: [
            {label: 'Species', value: 'Species', hidden: false},
            {label: 'Hybrid', value: 'Hybrid', hidden: false},
            {label: 'Specimen', value: 'Specimen', hidden: false},
            {label: 'Representative', value: 'Representative', hidden: false},
        ]
    },
}

export const sortOptions = []
export const defaultSort = [
    {
        label: 'A - Z',
        value: 'asc',
        sortFunction: (arr: Object[], value: String) => {
            return arr.sort()
        }
    },
    {
        label: 'Z - A',
        value: 'asc',
        sortFunction: (arr: Object[], value: String) => {
            return arr.sort()
        }
    },
    {
        label: '$ - $$$',
        value: 'asc',
        sortFunction: (arr: Object[], value: String) => {
            return arr.sort()
        }
    },
    {
        label: '$$$ - $',
        value: 'asc',
        sortFunction: (arr: Object[], value: String) => {
            return arr.sort()
        }
    },

]

export const newPlantCategory: PlantCategory = {
    id: '',
    name: '',
    genus: '',
    clone: '',
    speciesHybrid: '',
    experience: '',
    description: '',
    plants: [] as Plant[],
    status: 'In Stock',
    photos: [] as PhotoItem[]
}

export const newPlant: Plant = {
    id: '',
    sku: '',
    isRepresentative: false,
    size: '',
    propagationDate: new Date().toLocaleDateString('en-CA'),
    status: 'In Stock',
    price: 0,
    quantity: 1,
    photos: [],
    plantCategoryId: '',
    shelfLocation: '',
    dateListedForSale: null
}
