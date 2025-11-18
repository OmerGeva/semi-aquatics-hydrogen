import { PRODUCT_TYPES } from "../show-page/constants";

export const SIZING_DATA = {
  [PRODUCT_TYPES.tShirt]: [
    { size: 'XS', body: 26, chest: 18, sleeve: 11 },
    { size: 'S', body: 27, chest: 19.5, sleeve: 12.25 },
    { size: 'M', body: 28, chest: 20.5, sleeve: 14 },
    { size: 'L', body: 29, chest: 21.5, sleeve: 15 },
    { size: 'XL', body: 30, chest: 23, sleeve: 17 },
    { size: 'XXL', body: 31, chest: 24.5, sleeve: 18.25 },
  ],
  [PRODUCT_TYPES.cottonCrew]: [
    { size: 'S', body: 26.75, chest: 22.5, sleeve: 25 },
    { size: 'M', body: 28, chest: 23.5, sleeve: 25.5 },
    { size: 'L', body: 29.5, chest: 24.5, sleeve: 26 },
    { size: 'XL', body: 31, chest: 25.5, sleeve: 26.5 },
    { size: 'XXL', body: 32.5, chest: 26, sleeve: 27 },
  ],
  [PRODUCT_TYPES.hoody]: [
    { size: 'S', body: 26.75, chest: 22.25, sleeve: 25 },
    { size: 'M', body: 28, chest: 23.5, sleeve: 25.5 },
    { size: 'L', body: 29.5, chest: 24.5, sleeve: 26 },
    { size: 'XL', body: 31, chest: 25.5, sleeve: 26.5 },
    { size: 'XXL', body: 32.5, chest: 26, sleeve: 27 },
    { size: '3XL', body: 33.5, chest: 27, sleeve: 28 },
    { size: '4XL', body: 34.5, chest: 28, sleeve: 29 },
  ],
  [PRODUCT_TYPES.sweatPants]: [
    { size: 'S', inseam: 32, waist: 12, front: 14 },
    { size: 'M', inseam: 32, waist: 13, front: 14.5 },
    { size: 'L', inseam: 32, waist: 14, front: 15 },
    { size: 'XL', inseam: 32, waist: 15, front: 15.5 },
    { size: 'XXL', inseam: 32, waist: 16, front: 16 },
  ],
};