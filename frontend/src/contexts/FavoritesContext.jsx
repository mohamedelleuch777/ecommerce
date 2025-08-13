import React, { createContext } from 'react';

export const FavoritesContext = createContext({
  favorites: [],
  addToFavorites: () => {},
  removeFromFavorites: () => {},
  toggleFavorite: () => {},
  isFavorite: () => false,
  clearFavorites: () => {},
  favoritesCount: 0
});