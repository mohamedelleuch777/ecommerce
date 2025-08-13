import React, { useState, useEffect } from 'react';
import { FavoritesContext } from './FavoritesContext';
import { useAuth } from '../hooks/useAuth';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, api, loading: authLoading } = useAuth();

  // Load favorites from localStorage or API when component mounts
  useEffect(() => {
    // Don't load favorites until auth is initialized
    if (!authLoading) {
      loadFavorites();
    }
  }, [user, api, authLoading]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (!user) {
      // For guest users, save to localStorage
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const loadFavorites = async () => {
    if (user && api) {
      // Load from API for authenticated users
      try {
        setLoading(true);
        console.log('Loading favorites for user:', user.email, 'API instance available:', !!api);
        const response = await api.get('/favorites');
        console.log('Favorites loaded successfully:', response.data);
        setFavorites(response.data.favorites || []);
      } catch (error) {
        console.error('Failed to load favorites from server:', error);
        console.log('Error details:', error.response?.status, error.response?.data);
        // Fallback to localStorage
        loadFavoritesFromLocalStorage();
      } finally {
        setLoading(false);
      }
    } else {
      // Load from localStorage for guest users
      console.log('Loading favorites from localStorage, user:', !!user, 'api:', !!api);
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
    const productId = product._id || product.id;
    
    // Check if product is already in favorites
    if (favorites.some(fav => (fav._id || fav.id) === productId)) {
      return;
    }

    // Ensure the product has a consistent id field for local storage
    const productToStore = { ...product, id: productId };
    const newFavorites = [...favorites, productToStore];
    setFavorites(newFavorites);

    if (user) {
      // Sync with API for authenticated users
      try {
        await api.post('/favorites', { 
          productId: productId,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          category: product.category,
          description: product.description,
          rating: product.rating,
          reviews: product.reviews,
          inStock: product.inStock,
          discount: product.discount
        });
      } catch (error) {
        console.error('Failed to add favorite to server:', error);
        // Revert local change on API failure
        setFavorites(favorites);
      }
    }
  };

  const removeFromFavorites = async (productId) => {
    const newFavorites = favorites.filter(fav => (fav._id || fav.id) !== productId);
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
    const productId = product._id || product.id;
    if (isFavorite(productId)) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(product);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => (fav._id || fav.id) === productId);
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