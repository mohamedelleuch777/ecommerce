import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user favorites
router.get('/', authenticate, async (req, res) => {
  try {
    // req.user already contains the full user object from authenticate middleware
    const favorites = req.user.favorites.map(favorite => ({
      id: favorite.productId,
      name: favorite.name,
      price: favorite.price,
      originalPrice: favorite.originalPrice,
      image: favorite.image,
      category: favorite.category,
      description: favorite.description,
      rating: favorite.rating,
      reviews: favorite.reviews,
      inStock: favorite.inStock,
      discount: favorite.discount,
      addedAt: favorite.addedAt
    }));

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Add product to favorites
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, name, price, originalPrice, image, category, description, rating, reviews, inStock, discount } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product is already in favorites
    const existingFavorite = req.user.favorites.find(fav => fav.productId === productId);
    
    if (existingFavorite) {
      return res.status(409).json({ error: 'Product already in favorites' });
    }

    // Add to favorites
    const favoriteItem = {
      productId,
      name: name || 'Unknown Product',
      price: price || 0,
      originalPrice,
      image: image || '/images/placeholder.jpg',
      category: category || 'Uncategorized',
      description: description || '',
      rating: rating || 0,
      reviews: reviews || 0,
      inStock: inStock !== undefined ? inStock : true,
      discount: discount || 0,
      addedAt: new Date()
    };

    req.user.favorites.push(favoriteItem);
    await req.user.save();

    res.status(201).json({ 
      message: 'Product added to favorites',
      favorite: {
        id: favoriteItem.productId,
        ...favoriteItem
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove product from favorites
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Remove from favorites
    const initialLength = req.user.favorites.length;
    req.user.favorites = req.user.favorites.filter(fav => fav.productId !== productId);
    
    if (req.user.favorites.length === initialLength) {
      return res.status(404).json({ error: 'Product not found in favorites' });
    }

    await req.user.save();

    res.json({ message: 'Product removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Clear all favorites
router.delete('/', authenticate, async (req, res) => {
  try {
    req.user.favorites = [];
    await req.user.save();

    res.json({ message: 'All favorites cleared' });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({ error: 'Failed to clear favorites' });
  }
});

// Check if product is in favorites
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const isFavorite = req.user.favorites.some(fav => fav.productId === productId);
    
    res.json({ isFavorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;