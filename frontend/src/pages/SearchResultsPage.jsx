import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, Star, Heart, ShoppingCart, Filter } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import { getStandardizedCategorySlug } from '../utils/slugs';
import FavoriteButton from '../components/Common/FavoriteButton';
import ApiService from '../services/api';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { language } = useLanguage();
  
  const [searchResults, setSearchResults] = useState({ products: [], categories: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, sortBy, filterCategory]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const results = await ApiService.search(searchQuery, 50); // Get more results for full page
      let filteredProducts = results.products || [];

      // Apply category filter
      if (filterCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
          product.category.toLowerCase() === filterCategory.toLowerCase()
        );
      }

      // Apply sorting
      filteredProducts = sortProducts(filteredProducts, sortBy);

      setSearchResults({
        products: filteredProducts,
        categories: results.categories || [],
        total: filteredProducts.length + (results.categories?.length || 0)
      });
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ products: [], categories: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortType) => {
    switch (sortType) {
      case 'price-low':
        return [...products].sort((a, b) => parseFloat(a.price.replace('$', '').replace(',', '')) - parseFloat(b.price.replace('$', '').replace(',', '')));
      case 'price-high':
        return [...products].sort((a, b) => parseFloat(b.price.replace('$', '').replace(',', '')) - parseFloat(a.price.replace('$', '').replace(',', '')));
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...products].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      default: // relevance
        return products;
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(searchResults.products.map(product => product.category))];
    return categories;
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="container">
          <div className="loading-placeholder">
            <Search size={48} />
            <h2>{getTranslation('searching', language)}...</h2>
            <p>"{query}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">
            <ArrowLeft size={16} />
            {getTranslation('home', language)}
          </Link>
          <span>/</span>
          <span>{getTranslation('searchResults', language)}</span>
        </nav>

        {/* Search Header */}
        <div className="search-header">
          <div className="search-info">
            <h1>{getTranslation('searchResults', language)}</h1>
            <p className="search-query">"{query}"</p>
            <p className="results-count">
              {searchResults.total} {searchResults.total === 1 ? 'result' : 'results'} found
            </p>
          </div>
        </div>

        {searchResults.total === 0 ? (
          /* No Results */
          <div className="no-results">
            <Search size={64} />
            <h2>No results found</h2>
            <p>Try searching for something else or check your spelling</p>
            <Link to="/" className="back-home-btn">
              {getTranslation('continueShopping', language)}
            </Link>
          </div>
        ) : (
          <>
            {/* Categories Section */}
            {searchResults.categories.length > 0 && (
              <div className="categories-section">
                <h3>{getTranslation('categories', language)}</h3>
                <div className="categories-grid">
                  {searchResults.categories.map(category => (
                    <Link
                      key={category._id}
                      to={`/category/${getStandardizedCategorySlug(category.name)}`}
                      className="category-result-card"
                    >
                      <div className="category-info">
                        <h4>{category.name}</h4>
                        <p>{category.description}</p>
                        <span className="product-count">
                          {category.productCount || 0} {getTranslation('products', language)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {searchResults.products.length > 0 && (
              <div className="products-section">
                <div className="section-header">
                  <h3>{getTranslation('products', language)} ({searchResults.products.length})</h3>
                  
                  <div className="filters-sort">
                    {/* Category Filter */}
                    <div className="filter-group">
                      <Filter size={16} />
                      <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All Categories</option>
                        {getUniqueCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div className="sort-group">
                      <label>Sort by:</label>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="newest">Newest First</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="products-grid">
                  {searchResults.products.map(product => (
                    <div key={product._id} className="product-result-card">
                      <div className="product-image-container">
                        <Link to={`/product/${product._id}`}>
                          <img src={product.image} alt={product.name} className="product-image" />
                        </Link>
                        <div className="product-overlay">
                          <FavoriteButton product={product} className="overlay-favorite" />
                        </div>
                        {product.discount && (
                          <div className="discount-badge">
                            {product.discount}% OFF
                          </div>
                        )}
                        {!product.inStock && (
                          <div className="out-of-stock-overlay">
                            <span>{getTranslation('outOfStock', language)}</span>
                          </div>
                        )}
                      </div>

                      <div className="product-info">
                        <div className="product-category">{product.category}</div>
                        
                        <Link to={`/product/${product._id}`} className="product-name-link">
                          <h4 className="product-name">{product.name}</h4>
                        </Link>
                        
                        <p className="product-description">{product.description}</p>
                        
                        <div className="product-rating">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                                stroke={i < Math.floor(product.rating) ? '#ffc107' : '#ddd'}
                              />
                            ))}
                          </div>
                          <span className="rating-text">
                            {product.rating} ({product.reviews} {getTranslation('reviews', language)})
                          </span>
                        </div>

                        <div className="product-pricing">
                          <div className="price-row">
                            <span className="current-price">{product.price}</span>
                            {product.originalPrice && (
                              <span className="old-price">{product.originalPrice}</span>
                            )}
                          </div>
                        </div>

                        <button 
                          className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                          disabled={!product.inStock}
                        >
                          <ShoppingCart size={18} />
                          {product.inStock ? getTranslation('addToCart', language) : getTranslation('outOfStock', language)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;