import React, { useState, useEffect } from 'react';
import { FavoritesContext } from './FavoritesContext';
import { useAuth } from '../hooks/useAuth';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, api } = useAuth();

  // Load favorites from localStorage or API when component mounts
  useEffect(() => {
    loadFavorites();
  }, [user]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (!user) {
      // For guest users, save to localStorage
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const loadFavorites = async () => {
    if (user) {
      // Load from API for authenticated users
      try {
        setLoading(true);
        const response = await api.get('/favorites');
        setFavorites(response.data.favorites || []);
      } catch (error) {
        console.error('Failed to load favorites from server:', error);
        // Fallback to localStorage
        loadFavoritesFromLocalStorage();
      } finally {
        setLoading(false);
      }
    } else {
      // Load from localStorage for guest users
      loadFavoritesFromLocalStorage();
    }
  };

  const loadFavoritesFromLocalStorage = () => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
      setFavorites([]);
    }
  };

  const addToFavorites = async (product) => {
    // Check if product is already in favorites
    if (favorites.some(fav => fav.id === product.id)) {
      return;
    }

    const newFavorites = [...favorites, product];
    setFavorites(newFavorites);

    if (user) {
      // Sync with API for authenticated users
      try {
        await api.post('/favorites', { productId: product.id });
      } catch (error) {
        console.error('Failed to add favorite to server:', error);
        // Revert local change on API failure
        setFavorites(favorites);
      }
    }
  };

  const removeFromFavorites = async (productId) => {
    const newFavorites = favorites.filter(fav => fav.id !== productId);
    setFavorites(newFavorites);

    if (user) {
      // Sync with API for authenticated users
      try {
        await api.delete(`/favorites/${productId}`);
      } catch (error) {
        console.error('Failed to remove favorite from server:', error);
        // Revert local change on API failure
        setFavorites(favorites);
      }
    }
  };

  const toggleFavorite = async (product) => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  const clearFavorites = async () => {
    setFavorites([]);
    
    if (user) {
      try {
        await api.delete('/favorites');
      } catch (error) {
        console.error('Failed to clear favorites on server:', error);
      }
    } else {
      localStorage.removeItem('favorites');
    }
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
    loading
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};