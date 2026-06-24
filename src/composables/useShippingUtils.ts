import type { StandardBoxSizes, Carrier } from '@/types/Orders';
import type { PotSize } from '@/types/Plant';
import type { PackageWeightAndSize, BoxDimensions } from '@/types/Ebay';

export function getShippingSize(size: PotSize): PackageWeightAndSize {
  const sizeMap = new Map<PotSize, { box: StandardBoxSizes; weight: number }>([
    ['2.5"', { box: '7x5x5', weight: 1 }],
    ['3" deep', { box: '7x5x5', weight: 1 }],
    ['3.5"', { box: '7x5x5', weight: 1 }],
    ['3.5" deep', { box: '10x5x5', weight: 1.5 }],
    ['4" deep', { box: '10x8x6', weight: 1.75 }],
    ['4.5" deep', { box: '14x6x6', weight: 2 }],
    ['5" deep', { box: '7x5x5', weight: 2 }],
    ['Bare Root', { box: '10x8x6', weight: 1 }],
    ['Bundle - 2 sm', { box: '10x8x6', weight: 1.5 }],
    ['Bundle - 3 sm', { box: '10x8x6', weight: 2 }],
    ['Bundle - 2 lg', { box: '10x10x5', weight: 2 }],
    ['Bundle - 3 lg', { box: '14x6x6', weight: 3 }],
    ['Snack Bag', { box: '7x5x5', weight: 1 }],
    ['Sandwich Bag', { box: '7x5x5', weight: 1 }],
    ['Quart Bag', { box: '7x5x5', weight: 1 }],
  ]);

  const boxWeight = sizeMap.get(size) ?? { box: '10x8x6', weight: 1 };

  const boxSizeMap = buildBoxSizeMap();
  return {
    dimensions: boxSizeMap.get(boxWeight.box)!,
    // packageType: 'MAILING_BOX',
    weight: {
      value: boxWeight.weight,
      unit: 'POUND',
    },
  };
}

export function buildBoxSizeMap() {
  const boxSizeMap: Map<StandardBoxSizes, BoxDimensions> = new Map();
  boxSizeMap.set('7x5x5', {
    height: 7,
    length: 5,
    width: 5,
    unit: 'INCH',
  });
  boxSizeMap.set('10x5x5', {
    height: 10,
    length: 5,
    width: 5,
    unit: 'INCH',
  });
  boxSizeMap.set('10x8x6', {
    height: 10,
    length: 8,
    width: 6,
    unit: 'INCH',
  });
  boxSizeMap.set('14x6x6', {
    height: 14,
    length: 6,
    width: 6,
    unit: 'INCH',
  });
  return boxSizeMap;
}

export function getCarrier(trackingNumber: string): Carrier | '' {
  if (typeof trackingNumber !== 'string') {
    console.error('Invalid tracking number:', trackingNumber);
    return '';
  }
  if (trackingNumber.startsWith('1Z')) {
    return 'UPS';
  } else if (/^\d{12,22}$/.test(trackingNumber)) {
    return 'FedEx';
  } else if (/^[0-9]{20}$/.test(trackingNumber) || /^[0-9]{22}$/.test(trackingNumber)) {
    return 'USPS';
  } else {
    return '';
  }
}
