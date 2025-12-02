import admin from 'firebase-admin'
import { ParserOptions, parseString } from 'xml2js'
import { debug, error} from 'firebase-functions/logger'
import { parseBooleans, stripPrefix } from 'xml2js/lib/processors'
import { PlantCategory } from './types/Plants'


export async function getNextSequentialId(collectionName: string, startingValue = 1000, idFieldName: string = 'id') {
    let docs: Array<unknown> | undefined = []
    try {
        docs = await getAllDocs(collectionName)
    } catch (err) {
        console.log(err)
        return undefined
    }
    let nextSequentialId: number
    if (docs.length === 0) {
        return startingValue
    } else {
        nextSequentialId = docs.reduce((acc: number, doc: any) => acc = acc > parseInt(doc[idFieldName]) ? acc : parseInt(doc[idFieldName]), startingValue).valueOf()
        nextSequentialId++
    }
    return nextSequentialId
}

export async function getAllDocs<T>(collectionName: string) {
    const snap = await admin.firestore().collection(collectionName).get()
    return snap.docs.map(doc => doc.data() as T)
}

export async function getCategoryBySku(sku: string) {
    const categories = await getAllDocs<PlantCategory>('plantCategories')
    let categoryId: string | undefined = undefined
    for(let category of categories) {
        const plantSkus = category.plants.map(plant => plant.sku)
        if(plantSkus.includes(sku)) {
            categoryId = category.id
            break
        }
    }
    debug(`Found category ID ${categoryId} for SKU ${sku}`)
    return categoryId
}

export function unwrapResponse(obj: any) {
    if(!obj || typeof obj !== 'object') {
        return obj
    }
    if('data' in obj) {
        return unwrapResponse(obj.data)
    }
    if('res' in obj) {
        return unwrapResponse(obj.res)
    }
    return obj
}

export function getUpdateDateTime() {
    const updatedDateTime = new Date().toLocaleString("en-US", {timeZone: 'America/Chicago'})
    const updatedTimestamp = Math.floor(Date.now() / 1000)
    return { updatedDateTime, updatedTimestamp}
}

export function formatLocalDate(date: Date) {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day}:${hours}:${minutes}:${seconds}`;
}
export function parseXmlResponse(xml: any) {
    const options: ParserOptions = {
        trim: true,
        normalize: true,
        explicitArray: false,
        explicitRoot: false,
        tagNameProcessors: [stripPrefix],
        valueProcessors: [parseBooleans]
    }
    let parsed
    parseString(xml, options, (err, result) => {
        if(err) {
            error('Error parsing XML:', err)
            parsed = undefined
        }
        parsed = result
    })
    if(!parsed) {
        error('Parsed is undefined in parseXmlResponse')
        return undefined
    }
    const cleaned = cleanXML(parsed)
    //log(inspect(cleaned, false, 4))
    debug(cleaned)
    return cleaned

}

function cleanXML(xml: any) {
    let keys = Object.keys(xml)
    let o = 0
    let k = keys.length
    let node, value, singulars
    let l = -1, i = -1, s = -1, e = -1
    let isInt = /^-?\s*\d+$/
    let isDig = /^(-?\s*\d*\.?\d*)$/
    let radix = 10

    for(; o < k; ++o){
        node = keys[o];

        if(xml[node] instanceof Array && xml[node].length === 1){
            xml[node] = xml[node][0];
        }

        if(xml[node] instanceof Object){
            value = Object.keys(xml[node]);

            if(value.length === 1){
                l = node.length;

                singulars = [
                    node.substring(0, l - 1),
                    node.substring(0, l - 3) + 'y'
                ];

                i = singulars.indexOf(value[0]);

                if(i !== -1){
                    xml[node] = xml[node][singulars[i]];
                }
            }
        }

        if(typeof(xml[node]) === 'object'){
            xml[node] = cleanXML(xml[node]);
        }

        if(typeof(xml[node]) === 'string'){
            value = xml[node].trim();

            if(value.match(isDig)){
                if(value.match(isInt)){
                    if(Math.abs(parseInt(value, radix)) <= Number.MAX_SAFE_INTEGER){
                        xml[node] = parseInt(value, radix);
                    }
                }else{
                    l = value.length;

                    if(l <= 15){
                        xml[node] = parseFloat(value);
                    }else{
                        for(i = 0, s = -1, e = -1; i < l && e - s <= 15; ++i){
                            if(value.charAt(i) > 0){
                                if(s === -1){
                                    s = i;
                                }else{
                                    e = i;
                                }
                            }
                        }

                        if(e - s <= 15){
                            xml[node] = parseFloat(value);
                        }
                    }
                }
            }
        }
    }
    return xml
}

export function formatPrice(price: number) {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
  return USDollar.format(price / 100);
}