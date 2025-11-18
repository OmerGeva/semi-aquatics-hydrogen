import { cartActionTypes } from './cart.types'

const INITIAL_STATE = {
  cartItemCount: 0
}
const cartReducer = (state = INITIAL_STATE, action: { type: string; payload: object }) => {
  switch(action.type){
    case cartActionTypes.SET_CART_QUANTITY:
      return {
        ...state,
        cartItemCount: action.payload
      }

    default:
      return state;
  }
}

export default cartReducer;
