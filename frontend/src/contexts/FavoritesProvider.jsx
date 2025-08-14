import React, { useState, useEffect } from 'react';
import { FavoritesContext } from './FavoritesContext';
import { useAuth } from '../hooks/useAuth';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousUser, setPreviousUser] = useState(null);
  const { user, api, loading: authLoading } = useAuth();

  // Detect user logout and preserve favorites
  useEffect(() => {
    // If user was logged in but now is logged out (logout detected)
    if (previousUser && !user && favorites.length > 0) {
      console.log('User logout detected, preserving favorites to localStorage');
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
    
    // Update previousUser state
    setPreviousUser(user);
  }, [user, previousUser, favorites]);

  // Load favorites from localStorage or API when component mounts or user changes
  useEffect(() => {
    // Don't load favorites until auth is initialized
    if (!authLoading) {
      loadFavorites();
    }
  }, [user, api, authLoading]);

  // Save favorites to localStorage whenever favorites change (for guest users and as backup)
  useEffect(() => {
    // Always save to localStorage as backup, but don't save empty array on logout
    if (favorites.length > 0 || !user) {
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
        const serverFavorites = response.data.favorites || [];
        
        // Also check localStorage for any favorites that might not be synced
        const localFavorites = loadFavoritesFromLocalStorage(false);
        
        // Merge server and local favorites, prioritizing server data
        const mergedFavorites = mergeAndDeduplicateFavorites(serverFavorites, localFavorites);
        setFavorites(mergedFavorites);
        
        // Sync any local-only favorites to server in the background
        syncLocalFavoritesToServer(localFavorites, serverFavorites);
      } catch (error) {
        console.error('Failed to load favorites from server:', error);
        console.log('Error details:', error.response?.status, error.response?.data);
        // Fallback to localStorage
        const localFavorites = loadFavoritesFromLocalStorage(false);
        setFavorites(localFavorites);
      } finally {
        setLoading(false);
      }
    } else {
      // Load from localStorage for guest users
      console.log('Loading favorites from localStorage, user:', !!user, 'api:', !!api);
      const localFavorites = loadFavoritesFromLocalStorage(false);
      setFavorites(localFavorites);
    }
  };

  const loadFavoritesFromLocalStorage = (setStateDirectly = true) => {
    try {
      const storedFavorites = localStorage.getItem('favorites');
      const parsedFavorites = storedFavorites ? JSON.parse(storedFavorites) : [];
      
      if (setStateDirectly) {
        setFavorites(parsedFavorites);
      }
      
      return parsedFavorites;
    } catch (error) {
      console.error('Failed to load favorites from localStorage:', error);
      const emptyArray = [];
      
      if (setStateDirectly) {
        setFavorites(emptyArray);
      }
      
      return emptyArray;
    }
  };

  const mergeAndDeduplicateFavorites = (serverFavorites, localFavorites) => {
    // Create a map using product IDs to avoid duplicates
    const favoritesMap = new Map();
    
    // First add server favorites (these take priority)
    serverFavorites.forEach(fav => {
      const id = fav._id || fav.id;
      if (id) {
        favoritesMap.set(id, fav);
      }
    });
    
    // Then add local favorites that aren't already in server favorites
    localFavorites.forEach(fav => {
      const id = fav._id || fav.id;
      if (id && !favoritesMap.has(id)) {
        favoritesMap.set(id, fav);
      }
    });
    
    return Array.from(favoritesMap.values());
  };

  const syncLocalFavoritesToServer = async (localFavorites, serverFavorites) => {
    if (!user || !api || !localFavorites.length) return;
    
    // Find favorites that exist locally but not on server
    const serverIds = new Set(serverFavorites.map(fav => fav._id || fav.id));
    const localOnlyFavorites = localFavorites.filter(fav => {
      const id = fav._id || fav.id;
      return id && !serverIds.has(id);
    });
    
    // Sync each local-only favorite to server in the background
    for (const favorite of localOnlyFavorites) {
      try {
        console.log('Syncing local favorite to server:', favorite.name);
        await api.post('/favorites', {
          productId: favorite._id || favorite.id,
          name: favorite.name,
          price: favorite.price,
          originalPrice: favorite.originalPrice,
          image: favorite.image,
          category: favorite.category,
          description: favorite.description,
          rating: favorite.rating,
          reviews: favorite.reviews,
          inStock: favorite.inStock,
          discount: favorite.discount
        });
      } catch (error) {
        console.error('Failed to sync favorite to server:', favorite.name, error);
      }
    }
    
    // Clear localStorage after successful sync
    if (localOnlyFavorites.length > 0) {
      console.log(`Synced ${localOnlyFavorites.length} local favorites to server`);
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