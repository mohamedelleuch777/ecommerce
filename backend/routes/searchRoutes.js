import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import SearchAnalytics from '../models/SearchAnalytics.js';

const router = express.Router();

// Advanced search products and categories with filters
router.get('/search', async (req, res) => {
  try {
    const { 
      q, 
      limit = 20, 
      page = 1,
      category,
      minPrice,
      maxPrice,
      minRating,
      inStock,
      sortBy = 'relevance',
      featured
    } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({
        products: [],
        categories: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
        filters: {}
      });
    }

    const searchTerm = q.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Log search analytics with results count
    logSearchQuery(searchTerm, req.ip, { 
      category, 
      priceRange: minPrice || maxPrice ? `${minPrice || 0}-${maxPrice || 'max'}` : null,
      minRating,
      inStock: inStock === 'true'
    }).catch(err => 
      console.error('Search analytics error:', err)
    );

    // Build search query with filters
    const searchQuery = {
      $text: { $search: searchTerm }
    };

    // Build filter query
    const filterQuery = {};
    
    if (category && category !== 'all') {
      filterQuery.category = new RegExp(category, 'i');
    }
    
    if (minPrice || maxPrice) {
      filterQuery.price = {};
      if (minPrice) filterQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) filterQuery.price.$lte = parseFloat(maxPrice);
    }
    
    if (minRating) {
      filterQuery.rating = { $gte: parseFloat(minRating) };
    }
    
    if (inStock === 'true') {
      filterQuery.inStock = true;
    }
    
    if (featured === 'true') {
      filterQuery.featured = true;
    }

    // Combine search and filter queries
    const finalQuery = { ...searchQuery, ...filterQuery };

    // Fallback to regex search if text search fails
    let products;
    try {
      products = await Product.find(finalQuery);
    } catch (textSearchError) {
      console.log('Text search failed, falling back to regex search');
      const searchRegex = new RegExp(searchTerm, 'i');
      const fallbackQuery = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ],
        ...filterQuery
      };
      products = await Product.find(fallbackQuery);
    }

    // Sort products based on sortBy parameter
    products = await sortProductsAdvanced(products, sortBy);

    // Get total count for pagination
    const totalProducts = products.length;
    const paginatedProducts = products.slice(skip, skip + parseInt(limit));

    // Search categories (only for main search, not filtered searches)
    const categories = category ? [] : await Category.find({
      $or: [
        { name: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') }
      ]
    })
    .select('name description productCount')
    .limit(5);

    // Format price for products
    const formattedProducts = paginatedProducts.map(product => ({
      ...product.toObject(),
      price: formatPrice(product.price),
      originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null
    }));

    // Get aggregated filter data for frontend
    const aggregations = await getSearchAggregations(searchTerm);

    res.json({
      products: formattedProducts,
      categories: categories,
      total: totalProducts + categories.length,
      productCount: totalProducts,
      page: parseInt(page),
      totalPages: Math.ceil(totalProducts / parseInt(limit)),
      searchTerm,
      filters: aggregations
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

// Get product recommendations based on search history and viewed products
router.get('/recommendations/:productId?', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;
    
    let recommendations = [];
    
    if (productId) {
      // Get "Customers also viewed" products
      const currentProduct = await Product.findById(productId);
      if (currentProduct) {
        // Find products in same category with similar ratings
        recommendations = await Product.find({
          _id: { $ne: productId },
          category: currentProduct.category,
          rating: { $gte: currentProduct.rating - 1 }
        })
        .select('name description price originalPrice image category rating reviews inStock featured')
        .sort({ rating: -1, reviews: -1 })
        .limit(parseInt(limit));
      }
    } else {
      // Get general recommendations based on user's search history
      const userIP = req.ip;
      const recentSearches = await SearchAnalytics.find({ userIP })
        .sort({ createdAt: -1 })
        .limit(10);
        
      if (recentSearches.length > 0) {
        const searchTerms = recentSearches.map(s => s.query);
        const searchRegex = new RegExp(searchTerms.join('|'), 'i');
        
        recommendations = await Product.find({
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex }
          ],
          featured: true
        })
        .select('name description price originalPrice image category rating reviews inStock featured')
        .sort({ rating: -1, featured: -1 })
        .limit(parseInt(limit));
      }
      
      // Fallback to featured products if no search history
      if (recommendations.length === 0) {
        recommendations = await Product.find({ featured: true })
          .select('name description price originalPrice image category rating reviews inStock featured')
          .sort({ rating: -1, reviews: -1 })
          .limit(parseInt(limit));
      }
    }

    // Format prices
    const formattedRecommendations = recommendations.map(product => ({
      ...product.toObject(),
      price: formatPrice(product.price),
      originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null
    }));

    res.json({
      recommendations: formattedRecommendations,
      type: productId ? 'related' : 'personalized'
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Track product views for better recommendations
router.post('/track-view', async (req, res) => {
  try {
    const { productId, category } = req.body;
    const userIP = req.ip;
    
    // Log the product view for recommendation analytics
    await SearchAnalytics.create({
      query: `viewed:${productId}`,
      userIP,
      metadata: {
        type: 'product_view',
        productId,
        category
      },
      createdAt: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// Helper function to log search analytics with filters
async function logSearchQuery(query, userIP, filters = {}) {
  try {
    await SearchAnalytics.create({
      query: query.toLowerCase(),
      userIP,
      filters,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Failed to log search query:', error);
  }
}

// Advanced sorting function
async function sortProductsAdvanced(products, sortBy) {
  switch (sortBy) {
    case 'price-low':
      return products.sort((a, b) => a.price - b.price);
    case 'price-high':
      return products.sort((a, b) => b.price - a.price);
    case 'rating':
      return products.sort((a, b) => b.rating - a.rating);
    case 'reviews':
      return products.sort((a, b) => b.reviews - a.reviews);
    case 'newest':
      return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'popularity':
      return products.sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating));
    case 'discount':
      return products.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case 'relevance':
    default:
      return products.sort((a, b) => {
        // Boost featured products
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        // Then by rating and reviews
        return (b.rating * b.reviews) - (a.rating * a.reviews);
      });
  }
}

// Get search aggregations for filters
async function getSearchAggregations(searchTerm) {
  try {
    const searchRegex = new RegExp(searchTerm, 'i');
    
    // Get all matching products for aggregation
    let matchingProducts;
    try {
      matchingProducts = await Product.find({
        $text: { $search: searchTerm }
      });
    } catch (textSearchError) {
      matchingProducts = await Product.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { category: searchRegex }
        ]
      });
    }

    // Calculate aggregations
    const categories = [...new Set(matchingProducts.map(p => p.category))];
    const priceRange = {
      min: Math.min(...matchingProducts.map(p => p.price)),
      max: Math.max(...matchingProducts.map(p => p.price))
    };
    
    const ratingCounts = matchingProducts.reduce((acc, product) => {
      const rating = Math.floor(product.rating);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const inStockCount = matchingProducts.filter(p => p.inStock).length;
    const outOfStockCount = matchingProducts.length - inStockCount;

    return {
      categories: categories.map(cat => ({
        name: cat,
        count: matchingProducts.filter(p => p.category === cat).length
      })),
      priceRange,
      ratings: Object.keys(ratingCounts).map(rating => ({
        rating: parseInt(rating),
        count: ratingCounts[rating]
      })).sort((a, b) => b.rating - a.rating),
      availability: {
        inStock: inStockCount,
        outOfStock: outOfStockCount
      },
      totalResults: matchingProducts.length
    };
  } catch (error) {
    console.error('Aggregation error:', error);
    return {
      categories: [],
      priceRange: { min: 0, max: 1000 },
      ratings: [],
      availability: { inStock: 0, outOfStock: 0 },
      totalResults: 0
    };
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