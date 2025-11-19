import { collection, doc, getDoc, getDocs, query, where, deleteDoc, setDoc, type WhereFilterOp } from 'firebase/firestore'
import type { PlantCategory, Plant, PlantWithCategoryDetails } from '@/types/Plant'
import type { CartItem } from '@/types/Orders'
import { db } from '@/apis/firebase'
import { toast } from 'vue3-toastify'

export function parseJSON(jsonData: JSON) {
  try {
    return JSON.parse(JSON.stringify(jsonData))
  } catch (error) {
    console.log(error)
    return
  }
}

export async function getNextSequentialId(collectionName: string, idKeyName: string = 'id', startingValue = 1000) {
  let docs: Array<unknown> | undefined = []
  try {
    const res = await findAll(collectionName)
    if (Array.isArray(res) === false) return null;
    docs = res
  } catch (err) {
    console.log(err)
    return err
  }
  let nextSequentialId: number
  if (docs) {
    nextSequentialId = await docs
      .reduce((acc: number, doc: any) => (acc = acc > doc[idKeyName] ? acc : doc[idKeyName]), startingValue)
      .valueOf()
    nextSequentialId++
  } else {
    return { success: false, error: true, message: 'Unable to get next ID' }
  }
  return nextSequentialId
}

export async function saveItem(collectionName: string, obj: any, idKey: string = 'id') {
  if (obj == null || typeof obj !== 'object') {
    return { success: false, message: `Invalid object ${JSON.stringify(obj)}` }
  }

  if (!Object.prototype.hasOwnProperty.call(obj, idKey) || !obj[idKey]) {
    try {
      const nextId = await getNextSequentialId(collectionName, idKey)
      if (typeof nextId === 'number') {
        obj[idKey] = nextId
      }
    } catch (e) {
      console.error(e)
      return { success: false, errorDetails: e, message: 'Unable to get nextId for collection' }
    }
  }
  const cleanedObj = convertUndefinedToNull(obj)
  try {
    await setDoc(doc(db, collectionName, cleanedObj.id.toString()), { ...cleanedObj })
    return { success: true, message: 'Saved successfully', data: obj }
  } catch (err) {
    console.log(err)
    return { success: false, error: true, message: 'Unable to save', errorDetails: err, data: obj }
  }
}

function convertUndefinedToNull(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  for (const key in obj) {
    if (obj[key] === undefined) {
      console.error(`Converting undefined to null for key: ${key}`)
      debugger
      console.log(obj)
      obj[key] = null
    }
    else if (typeof obj[key] === 'object' && obj[key] !== null) {
      convertUndefinedToNull(obj[key])
    }
  }
  return obj
}

export async function saveObjectUpdateArray<T>(data: { collectionName: string, obj: Partial<T>, objArr: Array<T>, idKey?: keyof T }) {
  const idKey = data.idKey ?? 'id' as keyof T

  const res = await saveItem(data.collectionName, data.obj)
  if (res.success) {
    const idx = data.objArr?.findIndex(item => item[idKey] === data.obj[idKey])
    if (data.objArr && idx > -1) {
      data.objArr.splice(idx, 1, res.data)
    } else {
      data.objArr?.push(res.data)
    }
    toast.success('Success')
    return { success: true, message: res.message }
  } else {
    toast.error(`Error while saving: ${res.error}`)
    return { success: false, error: true, errorDetails: res?.error, message: 'There was an error saving' }
  }
}

export async function deleteItem(collectionName: string, id: number | string | symbol) {
  try {
    await deleteDoc(doc(db, collectionName, id.toString()))
    return { success: true, error: false, message: null, errorDetails: null }
  } catch (err) {
    return { success: false, error: true, errorDetails: err }
  }
}

export async function deleteItemUpdateArray<T, K extends keyof T>(data: { collectionName: string, id: T[K], objArr: Array<T>, idKey?: keyof T }) {
  const idKey = data.idKey ?? 'id' as keyof T
  const res = await deleteItem(data.collectionName, String(data.id))
  if (res.success) {
    const idx = data.objArr.findIndex(item => data.id === item[idKey])
    data.objArr.splice(idx, 1)
    toast.success('Success')
    return { success: true }
  } else {
    toast.error(`Error while deleting: ${res.error}`)
    return { success: false }
  }
}

export async function findDocById<T>(collectionName: string, id: number | string, idKey: keyof T = 'id' as keyof T): Promise<T | null> {
  const docRef = doc(db, collectionName, id.toString())
  const docSnap = await getDoc(docRef).catch((e) => console.error(e))
  if (docSnap && docSnap.exists()) {
    return docSnap.data() as T
  } else {
    return null
  }
}

export async function findByProperty(collectionName: string, property: string, comparison: WhereFilterOp = '==', value: any) {
  const returnArr: Array<any> = []
  const q = query(collection(db, collectionName), where(property, comparison, value))
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    returnArr.push({ ...doc.data() })
  })
  return returnArr
}

export async function findAll<T>(collectionName: string, includeId: boolean = false) {
  const snap = await getDocs(collection(db, collectionName))
  if (includeId) {
    return snap.docs.map((doc) => {
      return { ...(doc.data() as T), id: doc.id }
    })
  }
  return snap.docs.map((doc) => doc.data() as T)
}

export async function getPlantsFromFirestore(cartItems: CartItem[]): Promise<Plant[]> {
  let plants: Plant[] = []
  for (const category of cartItems) {
    const docRef = doc(db, 'plantCategories', category.categoryId.toString())
    const snap = await getDoc(docRef).catch((e: any) => console.error(e))
    if (snap && snap.data()) {
      const data = snap.data() as PlantCategory
      plants = plants.concat(data.plants)
    }
  }
  return plants
}

export async function getAllPlants() {
  const plants: PlantWithCategoryDetails[] = []
  const res = await findAll('plantCategories')
  if (res) {
    for (const category of res as PlantCategory[]) {
      for (const plant of category.plants) {
        plants.push({ ...plant, name: category.name, genus: category.genus, clone: category.clone })
      }
    }
  }
  return plants
}

export async function updateDocId(collectionName: string, oldDocId: string, newDocId: string) {
  const docRef = doc(db, collectionName, oldDocId.toString())
  const snap = await getDoc(docRef)
  const newDocRef = doc(db, collectionName, newDocId)
  const res = await setDoc(newDocRef, { ...snap.data() })
  return
}
