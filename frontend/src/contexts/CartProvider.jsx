import React, { useState, useEffect } from 'react';
import { CartContext } from './CartContext';
import { useAuth } from '../hooks/useAuth';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousUser, setPreviousUser] = useState(null);
  const { user, api, loading: authLoading } = useAuth();

  // Detect user logout and preserve cart
  useEffect(() => {
    // If user was logged in but now is logged out (logout detected)
    if (previousUser && !user && cart.length > 0) {
      console.log('User logout detected, preserving cart to localStorage');
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Update previousUser state
    setPreviousUser(user);
  }, [user, previousUser, cart]);

  // Load cart from localStorage or API when component mounts or user changes
  useEffect(() => {
    // Don't load cart until auth is initialized
    if (!authLoading) {
      loadCart();
    }
  }, [user, api, authLoading]);

  // Save cart to localStorage whenever cart changes (for guest users and as backup)
  useEffect(() => {
    // Always save to localStorage as backup, but don't save empty array on logout
    if (cart.length > 0 || !user) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const loadCart = async () => {
    if (user && api) {
      // Load from API for authenticated users
      try {
        setLoading(true);
        console.log('Loading cart for user:', user.email, 'API instance available:', !!api);
        const response = await api.get('/cart');
        console.log('Cart loaded successfully:', response.data);
        const serverCart = response.data.cart || [];
        
        // Also check localStorage for any cart items that might not be synced
        const localCart = loadCartFromLocalStorage(false);
        
        // Merge server and local cart, prioritizing server data
        const mergedCart = mergeAndDeduplicateCart(serverCart, localCart);
        setCart(mergedCart);
        
        // Sync any local-only cart items to server in the background
        syncLocalCartToServer(localCart, serverCart);
      } catch (error) {
        console.error('Failed to load cart from server:', error);
        console.log('Error details:', error.response?.status, error.response?.data);
        // Fallback to localStorage
        const localCart = loadCartFromLocalStorage(false);
        setCart(localCart);
      } finally {
        setLoading(false);
      }
    } else {
      // Load from localStorage for guest users
      console.log('Loading cart from localStorage, user:', !!user, 'api:', !!api);
      const localCart = loadCartFromLocalStorage(false);
      setCart(localCart);
    }
  };

  const loadCartFromLocalStorage = (setStateDirectly = true) => {
    try {
      const storedCart = localStorage.getItem('cart');
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];
      
      if (setStateDirectly) {
        setCart(parsedCart);
      }
      
      return parsedCart;
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      const emptyArray = [];
      
      if (setStateDirectly) {
        setCart(emptyArray);
      }
      
      return emptyArray;
    }
  };

  const mergeAndDeduplicateCart = (serverCart, localCart) => {
    // Create a map using product IDs to avoid duplicates
    const cartMap = new Map();
    
    // First add server cart items (these take priority)
    serverCart.forEach(item => {
      const id = item.product._id || item.product.id || item.productId;
      if (id) {
        cartMap.set(id, item);
      }
    });
    
    // Then add local cart items that aren't already in server cart
    // For local items, merge quantities if the product exists in server cart
    localCart.forEach(localItem => {
      const id = localItem.product?._id || localItem.product?.id || localItem.productId;
      if (id) {
        const existingItem = cartMap.get(id);
        if (existingItem) {
          // Merge quantities for existing items
          existingItem.quantity += localItem.quantity;
        } else {
          // Add new local items
          cartMap.set(id, localItem);
        }
      }
    });
    
    return Array.from(cartMap.values());
  };

  const syncLocalCartToServer = async (localCart, serverCart) => {
    if (!user || !api || !localCart.length) return;
    
    // Find cart items that exist locally but not on server
    const serverIds = new Set(serverCart.map(item => item.product._id || item.product.id || item.productId));
    const localOnlyItems = localCart.filter(item => {
      const id = item.product?._id || item.product?.id || item.productId;
      return id && !serverIds.has(id);
    });
    
    // Sync each local-only cart item to server in the background
    for (const cartItem of localOnlyItems) {
      try {
        console.log('Syncing local cart item to server:', cartItem.product?.name || 'Unknown product');
        await api.post('/cart', {
          productId: cartItem.product?._id || cartItem.product?.id || cartItem.productId,
          quantity: cartItem.quantity
        });
      } catch (error) {
        console.error('Failed to sync cart item to server:', cartItem.product?.name || 'Unknown product', error);
      }
    }
    
    // Clear localStorage after successful sync
    if (localOnlyItems.length > 0) {
      console.log(`Synced ${localOnlyItems.length} local cart items to server`);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const productId = product._id || product.id;
    
    // Check if product is already in cart
    const existingItemIndex = cart.findIndex(item => {
      const itemId = item.product?._id || item.product?.id || item.productId;
      return itemId === productId;
    });

    let newCart;
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const cartItem = {
        productId,
        product: { ...product, id: productId },
        quantity,
        addedAt: new Date().toISOString()
      };
      newCart = [...cart, cartItem];
    }
    
    setCart(newCart);

    if (user && api) {
      // Sync with API for authenticated users
      try {
        await api.post('/cart', { 
          productId: productId,
          quantity: quantity
        });
      } catch (error) {
        console.error('Failed to add item to cart on server:', error);
        // Revert local change on API failure
        setCart(cart);
        throw error; // Re-throw to allow UI to handle the error
      }
    }
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter(item => {
      const itemId = item.product?._id || item.product?.id || item.productId;
      return itemId !== productId;
    });
    setCart(newCart);

    if (user && api) {
      // Sync with API for authenticated users
      try {
        await api.delete(`/cart/${productId}`);
      } catch (error) {
        console.error('Failed to remove item from cart on server:', error);
        // Revert local change on API failure
        setCart(cart);
        throw error;
      }
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }

    const newCart = cart.map(item => {
      const itemId = item.product?._id || item.product?.id || item.productId;
      if (itemId === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCart(newCart);

    if (user && api) {
      // Sync with API for authenticated users
      try {
        await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      } catch (error) {
        console.error('Failed to update cart item quantity on server:', error);
        // Revert local change on API failure
        setCart(cart);
        throw error;
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    
    if (user && api) {
      try {
        await api.delete('/cart');
      } catch (error) {
        console.error('Failed to clear cart on server:', error);
      }
    } else {
      localStorage.removeItem('cart');
    }
  };

  const isInCart = (productId) => {
    return cart.some(item => {
      const itemId = item.product?._id || item.product?.id || item.productId;
      return itemId === productId;
    });
  };

  const getCartItemQuantity = (productId) => {
    const item = cart.find(item => {
      const itemId = item.product?._id || item.product?.id || item.productId;
      return itemId === productId;
    });
    return item?.quantity || 0;
  };

  // Calculate cart totals
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartTotal = cart.reduce((total, item) => {
    const price = Number(item.product?.price) || 0;
    return total + (price * item.quantity);
  }, 0);

  const cartSubtotal = cartTotal;
  const cartTax = cartTotal * 0.1; // 10% tax
  const cartShipping = cartTotal > 50 ? 0 : 9.99; // Free shipping over $50
  const cartGrandTotal = cartSubtotal + cartTax + cartShipping;

  const value = {
    cart,
    cartCount,
    cartTotal: cartSubtotal,
    cartSubtotal,
    cartTax,
    cartShipping,
    cartGrandTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItemQuantity,
    loading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};