export const addItemToCart = (cartItems: any, itemToAdd: any) => {
    const noSize = itemToAdd[0] == null ? true : false
  
    const existingCartItem = cartItems.find(
      (cartItem: any) => noSize ? cartItem.id === itemToAdd[1].id : cartItem.id === itemToAdd[0].id);
  
    if (existingCartItem){
      return cartItems.map((cartItem: any) =>
          noSize ?
          (cartItem.id === itemToAdd[1].id ? {...itemToAdd[1], quantity: cartItem.quantity + 1, price: itemToAdd[1].variants[0].price, productName: itemToAdd[1].title} : cartItem)
          :
          (cartItem.id === itemToAdd[0].id ? {...itemToAdd[0], quantity: cartItem.quantity + 1, productName: itemToAdd[1].title} : cartItem)
        )
    }
    return noSize ?
    [...cartItems, {...itemToAdd[1], quantity: 1, productName: itemToAdd[1].title, price: itemToAdd[1].variants[0].price}]
      :
    [...cartItems, {...itemToAdd[0], quantity: 1, productName: itemToAdd[1].title}]
  }