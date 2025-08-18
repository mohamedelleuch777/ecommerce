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
  const [currentPage, setCurrentPage] = useState(1);
  const [showPagination, setShowPagination] = useState(false);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, sortBy, filterCategory, currentPage]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      // Use advanced search API for better results
      const searchParams = {
        q: searchQuery,
        page: currentPage,
        limit: 20,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        sortBy: sortBy
      };

      const results = await ApiService.advancedSearch(searchParams);
      
      setSearchResults({
        products: results.products || [],
        categories: results.categories || [],
        total: results.productCount || 0,
        totalPages: results.totalPages || 0
      });

      setShowPagination(results.totalPages > 1);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ products: [], categories: [], total: 0, totalPages: 0 });
      setShowPagination(false);
    } finally {
      setLoading(false);
    }
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(searchResults.products.map(product => product.category))];
    return categories;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'category') {
      setFilterCategory(value);
    } else if (filterType === 'sort') {
      setSortBy(value);
    }
    setCurrentPage(1); // Reset to first page when filters change
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
          <div className={styles.searchActions}>
            <Link 
              to={`/advanced-search?q=${encodeURIComponent(query)}`}
              className={styles.advancedSearchLink}
            >
              <Filter size={16} />
              {getTranslation('advancedSearch', language)}
            </Link>
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
                        onChange={(e) => handleFilterChange('category', e.target.value)}
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
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                        className={styles.sortSelect}
                      >
                        <option value="relevance">{getTranslation('relevance', language)}</option>
                        <option value="price-low">{getTranslation('priceLowToHigh', language)}</option>
                        <option value="price-high">{getTranslation('priceHighToLow', language)}</option>
                        <option value="rating">{getTranslation('highestRated', language)}</option>
                        <option value="reviews">{getTranslation('mostReviewed', language)}</option>
                        <option value="newest">{getTranslation('newest', language)}</option>
                        <option value="popularity">{getTranslation('popularity', language)}</option>
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

                {/* Pagination */}
                {showPagination && (
                  <div className={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={styles.pageButton}
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(5, searchResults.totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === searchResults.totalPages}
                      className={styles.pageButton}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;