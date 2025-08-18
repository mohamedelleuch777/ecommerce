import { createContext } from 'react';

export const CartContext = createContext({
  cart: [],
  cartCount: 0,
  cartTotal: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isInCart: () => false,
  loading: false
});