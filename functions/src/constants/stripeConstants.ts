const standardFreeShippingThreshold = 7500;
const coldWeatherFreeShippingThreshold = 15000;

export const isColdWeatherShippingActive = false;
export const discountedShippingThreshold = isColdWeatherShippingActive ? coldWeatherFreeShippingThreshold : standardFreeShippingThreshold;

export const standardShippingId = 'shr_1PhcE1HlHApXEku9jEjOnRY5';
export const expeditedShippingId = 'shr_1PhcIRHlHApXEku9VDJcMwh1';
export const discountedStandardShippingId = 'shr_1PhcE6HlHApXEku9pLjd8otH';
export const discountedExpeditedShippingId = 'shr_1R2cEFHlHApXEku99i2HiYTx';
export const coldWeatherShippingId = 'shr_1QgwacHlHApXEku9NOmO8GBA';
export const discountedColdWeatherShippingId = 'shr_1Qgwb2HlHApXEku9geKIWtCT';
export const mossShippingId = 'shr_1R4ZfVHlHApXEku9ZqnKMqC2';
export const mossShippingCategoryId = '600';
