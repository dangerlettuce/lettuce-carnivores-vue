export function sortNumerically(arr: any[], prop = 'id') {
  arr.sort((a, b) => {
    return parseInt(a[prop]) - parseInt(b[prop]);
  });
}
export function sortAlphabetically(arr: any[], prop: keyof typeof arr) {
  arr.sort((a: any, b: any) => a[prop].localeCompare(b[prop]));
}

export function formattedDate(someDate: string | Date, format: 'mm/dd/yy' | 'yyyy-mm-dd' = 'mm/dd/yy') {
  let date;
  if (typeof someDate === 'string') {
    date = new Date(`${someDate}T00:00`);
  } else {
    date = someDate;
  }
  let formatOptions: Intl.DateTimeFormatOptions;
  switch (format) {
    case 'yyyy-mm-dd':
      formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
      break;
    case 'mm/dd/yy':
      formatOptions = { month: '2-digit', day: '2-digit', year: '2-digit' };
      break;
    default:
      formatOptions = { month: '2-digit', day: '2-digit', year: '2-digit' };
  }
  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}

export function formatFirebaseDate(firebaseDate: any) {
  const date = new Date(firebaseDate.seconds * 1000);
  return new Intl.DateTimeFormat('en-US', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatDate(date: any) {
  const inputType = typeof date;

  if (inputType === 'object' && 'seconds' in date) {
    return formatFirebaseDate(date);
  }
  if (date instanceof Date || inputType === 'string') {
    return formattedDate(date);
  }
  return undefined;
}

export const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export function arrayMove(arr: Array<any>, fromIndex: number, toIndex: number) {
  if (toIndex > arr.length - 1) {
    console.log('Unable to move in array, toIndex greater than arr.length. toIndex:' + toIndex + 'arr.length: ' + arr.length);
  }
  const ele = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, ele);
}
