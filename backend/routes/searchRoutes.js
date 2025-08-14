import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SearchAnalytics from '../models/SearchAnalytics.js';

const router = express.Router();

// Search products and categories
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        products: [],
        categories: [],
        total: 0
      });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Log search analytics (don't wait for it)
    logSearchQuery(searchTerm, req.ip).catch(err => 
      console.error('Search analytics error:', err)
    );

    // Search products
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { tags: { $in: [searchRegex] } }
      ]
    })
    .select('name description price originalPrice image category inStock featured rating reviews')
    .limit(parseInt(limit))
    .sort({ featured: -1, rating: -1 });

    // Search categories  
    const categories = await Category.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    })
    .select('name description productCount')
    .limit(5);

    // Format price for products
    const formattedProducts = products.map(product => ({
      ...product.toObject(),
      price: formatPrice(product.price),
      originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null
    }));

    res.json({
      products: formattedProducts,
      categories: categories,
      total: formattedProducts.length + categories.length,
      searchTerm
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get search suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    
    // Get product name suggestions
    const productSuggestions = await Product.aggregate([
      {
        $match: {
          name: searchRegex
        }
      },
      {
        $project: {
          suggestion: '$name',
          type: { $literal: 'product' },
          _id: 0
        }
      },
      { $limit: 5 }
    ]);

    // Get category suggestions
    const categorySuggestions = await Category.aggregate([
      {
        $match: {
          name: searchRegex
        }
      },
      {
        $project: {
          suggestion: '$name',
          type: { $literal: 'category' },
          _id: 0
        }
      },
      { $limit: 3 }
    ]);

    const suggestions = [...productSuggestions, ...categorySuggestions]
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, 8);

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// Get trending searches
router.get('/trending', async (req, res) => {
  try {
    const trending = await SearchAnalytics.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      },
      {
        $group: {
          _id: '$query',
          count: { $sum: 1 },
          lastSearched: { $max: '$createdAt' }
        }
      },
      {
        $sort: { count: -1, lastSearched: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          query: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Fallback trending searches if no analytics data
    const fallbackTrending = [
      'iPhone 15 Pro Max',
      'PlayStation 5',
      'MacBook Air M2',
      'Samsung Galaxy S24',
      'AirPods Pro',
      'Gaming Laptop',
      'Wireless Headphones',
      'Smart Watch',
      'iPad Pro',
      'Nintendo Switch'
    ];

    const trendingQueries = trending.length > 0 
      ? trending.map(item => item.query)
      : fallbackTrending;

    res.json({ trending: trendingQueries.slice(0, 8) });

  } catch (error) {
    console.error('Trending searches error:', error);
    res.status(500).json({ error: 'Failed to get trending searches' });
  }
});

// Get recent searches for a user (based on IP for now)
router.get('/recent', async (req, res) => {
  try {
    const userIP = req.ip;
    
    const recentSearches = await SearchAnalytics.find({ 
      userIP 
    })
    .select('query')
    .sort({ createdAt: -1 })
    .limit(5);

    const queries = recentSearches.map(search => search.query);
    
    res.json({ recent: queries });

  } catch (error) {
    console.error('Recent searches error:', error);
    res.status(500).json({ error: 'Failed to get recent searches' });
  }
});

// Helper function to log search analytics
async function logSearchQuery(query, userIP) {
  try {
    await SearchAnalytics.create({
      query: query.toLowerCase(),
      userIP,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Failed to log search query:', error);
  }
}

// Helper function to format price
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}

export default router;