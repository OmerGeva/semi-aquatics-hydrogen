import { cartActionTypes } from './cart.types';

export const addItemToCart = (variantProduct: any, product: any) => ({
    type: cartActionTypes.ADD_ITEM,
    payload: [variantProduct, product]
})

export const setCartId = (cartId: string) => ({
    type: cartActionTypes.SET_CART_ID,
    payload: cartId
})
export const setCartQuantity = (quantity: number) => ({
  type: cartActionTypes.SET_CART_QUANTITY,
  payload: quantity
})
