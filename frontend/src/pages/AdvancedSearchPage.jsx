import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowLeft, 
  Star, 
  Filter, 
  X, 
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import ApiService from '../services/api';
import FavoriteButton from '../components/Common/FavoriteButton';
import usePageTitle from '../hooks/usePageTitle';
import styles from './AdvancedSearchPage.module.css';

const AdvancedSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const query = searchParams.get('q') || '';

  usePageTitle('advancedSearch', query);

  // Search state
  const [searchTerm, setSearchTerm] = useState(query);
  const [searchResults, setSearchResults] = useState({
    products: [],
    total: 0,
    page: 1,
    totalPages: 0,
    filters: {}
  });
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    sortBy: searchParams.get('sortBy') || 'relevance'
  });

  // UI state
  const [showFilters, setShowFilters] = useState(true);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    price: true,
    rating: true,
    availability: true
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
  }, [filters, currentPage, searchTerm]);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const searchQuery = {
        q: searchTerm,
        page: currentPage,
        limit: 12,
        ...filters
      };

      // Remove empty filters
      Object.keys(searchQuery).forEach(key => {
        if (searchQuery[key] === '' || searchQuery[key] === 'all') {
          delete searchQuery[key];
        }
      });

      const results = await ApiService.advancedSearch(searchQuery);
      setSearchResults(results);

      // Update URL with current filters
      const newParams = new URLSearchParams();
      newParams.set('q', searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          newParams.set(key, value.toString());
        }
      });
      if (currentPage > 1) {
        newParams.set('page', currentPage.toString());
      }
      setSearchParams(newParams);

    } catch (error) {
      console.error('Advanced search failed:', error);
      setSearchResults({
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
        filters: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      inStock: false,
      featured: false,
      sortBy: 'relevance'
    });
    setCurrentPage(1);
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy') return false;
      return value && value !== 'all' && value !== '';
    }).length;
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    performSearch();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.advancedSearchPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">
            <ArrowLeft size={16} />
            {getTranslation('home', language)}
          </Link>
          <span>/</span>
          <span>{getTranslation('advancedSearch', language)}</span>
        </nav>

        {/* Search Header */}
        <div className={styles.searchHeader}>
          <h1>{getTranslation('advancedSearch', language)}</h1>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={getTranslation('searchPlaceholder', language)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                {getTranslation('search', language)}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.searchContainer}>
          {/* Filter Sidebar */}
          <div className={`${styles.filterSidebar} ${!showFilters ? styles.hidden : ''}`}>
            <div className={styles.filterHeader}>
              <h3>
                <Filter size={18} />
                {getTranslation('filters', language)}
                {getActiveFilterCount() > 0 && (
                  <span className={styles.filterCount}>({getActiveFilterCount()})</span>
                )}
              </h3>
              <div className={styles.filterActions}>
                <button 
                  onClick={clearAllFilters} 
                  className={styles.clearFilters}
                  disabled={getActiveFilterCount() === 0}
                >
                  <RefreshCw size={16} />
                  {getTranslation('clearAll', language)}
                </button>
                <button 
                  onClick={() => setShowFilters(false)} 
                  className={styles.hideFilters}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className={styles.filterSection}>
              <button 
                className={styles.filterToggle}
                onClick={() => toggleFilterSection('category')}
              >
                <span>{getTranslation('categories', language)}</span>
                {expandedFilters.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFilters.category && (
                <div className={styles.filterContent}>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className={styles.filterSelect}
                  >
                    <option value="all">{getTranslation('allCategories', language)}</option>
                    {searchResults.filters?.categories?.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className={styles.filterSection}>
              <button 
                className={styles.filterToggle}
                onClick={() => toggleFilterSection('price')}
              >
                <span>{getTranslation('priceRange', language)}</span>
                {expandedFilters.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFilters.price && (
                <div className={styles.filterContent}>
                  <div className={styles.priceInputs}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className={styles.priceInput}
                      min="0"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className={styles.priceInput}
                      min="0"
                    />
                  </div>
                  {searchResults.filters?.priceRange && (
                    <div className={styles.priceHint}>
                      Range: ${searchResults.filters.priceRange.min} - ${searchResults.filters.priceRange.max}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div className={styles.filterSection}>
              <button 
                className={styles.filterToggle}
                onClick={() => toggleFilterSection('rating')}
              >
                <span>{getTranslation('rating', language)}</span>
                {expandedFilters.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFilters.rating && (
                <div className={styles.filterContent}>
                  <div className={styles.ratingOptions}>
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className={styles.ratingOption}>
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={filters.minRating === rating.toString()}
                          onChange={(e) => handleFilterChange('minRating', e.target.value)}
                        />
                        <div className={styles.ratingStars}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rating ? '#ffc107' : 'none'}
                              stroke={i < rating ? '#ffc107' : '#ddd'}
                            />
                          ))}
                          <span>& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Availability Filter */}
            <div className={styles.filterSection}>
              <button 
                className={styles.filterToggle}
                onClick={() => toggleFilterSection('availability')}
              >
                <span>{getTranslation('availability', language)}</span>
                {expandedFilters.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedFilters.availability && (
                <div className={styles.filterContent}>
                  <label className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    />
                    <span>{getTranslation('inStockOnly', language)}</span>
                  </label>
                  <label className={styles.checkboxOption}>
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                    />
                    <span>{getTranslation('featuredOnly', language)}</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Results Area */}
          <div className={styles.resultsArea}>
            {!showFilters && (
              <button 
                onClick={() => setShowFilters(true)} 
                className={styles.showFilters}
              >
                <Filter size={16} />
                {getTranslation('showFilters', language)} 
                {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
              </button>
            )}

            {/* Results Header */}
            {searchResults.productCount !== undefined && (
              <div className={styles.resultsHeader}>
                <div className={styles.resultsInfo}>
                  <h2>
                    {searchResults.productCount} {getTranslation('results', language)} 
                    {searchTerm && ` for "${searchTerm}"`}
                  </h2>
                  {getActiveFilterCount() > 0 && (
                    <p className={styles.filterSummary}>
                      {getActiveFilterCount()} {getTranslation('filtersApplied', language)}
                    </p>
                  )}
                </div>

                <div className={styles.sortWrapper}>
                  <label>{getTranslation('sortBy', language)}:</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
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
            )}

            {/* Loading State */}
            {loading && (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>{getTranslation('searching', language)}...</p>
              </div>
            )}

            {/* No Results */}
            {!loading && searchResults.productCount === 0 && searchTerm && (
              <div className={styles.noResults}>
                <Search size={64} />
                <h3>{getTranslation('noResults', language)}</h3>
                <p>{getTranslation('noResultsDesc', language)}</p>
                <button onClick={clearAllFilters} className={styles.clearFiltersBtn}>
                  {getTranslation('clearFilters', language)}
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && searchResults.products.length > 0 && (
              <>
                <div className={styles.productsGrid}>
                  {searchResults.products.map(product => (
                    <div key={product._id} className={styles.productCard}>
                      <div className={styles.productImageContainer}>
                        <Link to={`/product/${product._id}`}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className={styles.productImage} 
                          />
                        </Link>
                        <div className={styles.productOverlay}>
                          <FavoriteButton product={product} />
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
                            {product.rating} ({product.reviews})
                          </span>
                        </div>

                        <div className={styles.productPricing}>
                          <span className={styles.currentPrice}>{product.price}</span>
                          {product.originalPrice && (
                            <span className={styles.oldPrice}>{product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {searchResults.totalPages > 1 && (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;