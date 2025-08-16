import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, Star, Heart, ShoppingCart, Filter } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import { getStandardizedCategorySlug } from '../utils/slugs';
import FavoriteButton from '../components/Common/FavoriteButton';
import ApiService from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import styles from './SearchResultsPage.module.css';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { language } = useLanguage();

  usePageTitle('searchPageTitle', query);
  
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
      <div className={styles.searchResultsPage}>
        <div className="container">
          <div className={styles.loadingPlaceholder}>
            <Search size={48} />
            <h2>{getTranslation('searching', language)}...</h2>
            <p>"{query}"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.searchResultsPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">
            <ArrowLeft size={16} />
            {getTranslation('home', language)}
          </Link>
          <span>/</span>
          <span>{getTranslation('searchResults', language)}</span>
        </nav>

        {/* Search Header */}
        <div className={styles.searchHeader}>
          <div className="search-info">
            <h1>{getTranslation('searchResults', language)}</h1>
            <p className={styles.searchQuery}>"{query}"</p>
            <p className={styles.resultsCount}>
              {searchResults.total} {searchResults.total === 1 ? 'result' : 'results'} found
            </p>
          </div>
        </div>

        {searchResults.total === 0 ? (
          /* No Results */
          <div className={styles.noResults}>
            <Search size={64} />
            <h2>No results found</h2>
            <p>Try searching for something else or check your spelling</p>
            <Link to="/" className={styles.backHomeBtn}>
              {getTranslation('continueShopping', language)}
            </Link>
          </div>
        ) : (
          <>
            {/* Categories Section */}
            {searchResults.categories.length > 0 && (
              <div className={styles.categoriesSection}>
                <h3>{getTranslation('categories', language)}</h3>
                <div className={styles.categoriesGrid}>
                  {searchResults.categories.map(category => (
                    <Link
                      key={category._id}
                      to={`/category/${getStandardizedCategorySlug(category.name)}`}
                      className={styles.categoryResultCard}
                    >
                      <div className={styles.categoryInfo}>
                        <h4>{category.name}</h4>
                        <p>{category.description}</p>
                        <span className={styles.productCount}>
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
              <div className={styles.productsSection}>
                <div className={styles.sectionHeader}>
                  <h3>{getTranslation('products', language)} ({searchResults.products.length})</h3>
                  
                  <div className={styles.filtersSort}>
                    {/* Category Filter */}
                    <div className={styles.filterGroup}>
                      <Filter size={16} />
                      <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={styles.filterSelect}
                      >
                        <option value="all">All Categories</option>
                        {getUniqueCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div className={styles.sortGroup}>
                      <label>Sort by:</label>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.sortSelect}
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

                <div className={styles.productsGrid}>
                  {searchResults.products.map(product => (
                    <div key={product._id} className={styles.productResultCard}>
                      <div className={styles.productImageContainer}>
                        <Link to={`/product/${product._id}`}>
                          <img src={product.image} alt={product.name} className={styles.productImage} />
                        </Link>
                        <div className={styles.productOverlay}>
                          <FavoriteButton product={product} className={styles.overlayFavorite} />
                        </div>
                        {product.discount && (
                          <div className={styles.discountBadge}>
                            {product.discount}% OFF
                          </div>
                        )}
                        {!product.inStock && (
                          <div className={styles.outOfStockOverlay}>
                            <span>{getTranslation('outOfStock', language)}</span>
                          </div>
                        )}
                      </div>

                      <div className={styles.productInfo}>
                        <div className={styles.productCategory}>{product.category}</div>
                        
                        <Link to={`/product/${product._id}`} className={styles.productNameLink}>
                          <h4 className={styles.productName}>{product.name}</h4>
                        </Link>
                        
                        <p className={styles.productDescription}>{product.description}</p>
                        
                        <div className={styles.productRating}>
                          <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                                stroke={i < Math.floor(product.rating) ? '#ffc107' : '#ddd'}
                              />
                            ))}
                          </div>
                          <span className={styles.ratingText}>
                            {product.rating} ({product.reviews} {getTranslation('reviews', language)})
                          </span>
                        </div>

                        <div className={styles.productPricing}>
                          <div className={styles.priceRow}>
                            <span className={styles.currentPrice}>{product.price}</span>
                            {product.originalPrice && (
                              <span className={styles.oldPrice}>{product.originalPrice}</span>
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