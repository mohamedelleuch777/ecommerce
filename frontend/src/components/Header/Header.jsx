import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, Phone, Heart, TrendingUp, Clock, Globe, LogOut, Package, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { useFavorites } from '../../hooks/useFavorites';
import { getTranslation } from '../../utils/translations';
import { getStandardizedCategorySlug } from '../../utils/slugs';
import ApiService from '../../services/api';
import LoginModal from '../Auth/LoginModal';
import styles from './Header.module.css';
import logo from '../../assets/logo-text.png';

const Header = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [searchResults, setSearchResults] = useState({ products: [], categories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const handleInputFocus = () => {
    setIsSearchOpen(true);
  };

  const handleUserClick = () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsSearchOpen(false), 200);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const results = await ApiService.search(searchTerm);
        // Navigate to search results page or handle results
        console.log('Search results:', results);
        setIsSearchOpen(false);
        // TODO: Navigate to search results page
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setIsSearchOpen(false);
    // Trigger search with the selected suggestion
    handleSearchSubmit({ preventDefault: () => {} });
  };

  // Debounced search function
  const performSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults({ products: [], categories: [] });
      return;
    }

    setIsSearching(true);
    try {
      const results = await ApiService.search(query, 6);
      setSearchResults({
        products: results.products || [],
        categories: results.categories || []
      });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ products: [], categories: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ApiService.getCategories(language);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback to default categories if API fails
        setCategories([
          { name: 'Electronics', count: 156 },
          { name: 'Fashion', count: 89 },
          { name: 'Home & Garden', count: 67 },
          { name: 'Sports & Outdoors', count: 45 },
          { name: 'Health & Beauty', count: 78 }
        ]);
      }
    };

    fetchCategories();
  }, [language]);

  // Fetch search-related data on component mount
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [trending, recent] = await Promise.all([
          ApiService.getTrendingSearches(),
          ApiService.getRecentSearches()
        ]);
        
        setTrendingSearches(trending.trending || []);
        setRecentSearches(recent.recent || []);
      } catch (error) {
        console.error('Failed to fetch search data:', error);
        // Set fallback data
        setTrendingSearches([
          'iPhone 15 Pro Max',
          'PlayStation 5',
          'MacBook Air M2',
          'Samsung Galaxy S24',
          'AirPods Pro',
          'Gaming Laptop'
        ]);
      }
    };

    fetchSearchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div className={styles.container}>
          <div className={styles.headerTopLeft}>
            <span className={styles.location}>
              <MapPin size={16} />
              {getTranslation('storeFinder', language)}
            </span>
            <span className={styles.phone}>
              <Phone size={16} />
              +1 (555) 123-4567
            </span>
          </div>
          <div className={styles.headerTopRight}>
            <span>{getTranslation('campaigns', language)}</span>
            <span>{getTranslation('corporate', language)}</span>
            <span>{getTranslation('help', language)}</span>
            <div className={styles.languageSwitcher}>
              <Globe size={16} />
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className={styles.languageSelect}
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.headerMain}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.logo}>
              <Link to="/">
                <img src={logo} alt="Logo" />
                {/* <h1>{getTranslation('brandName', language)}</h1> */}
              </Link>
            </div>

            <div className={styles.searchContainer} ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className={styles.searchBox}>
                <input
                  type="text"
                  placeholder={getTranslation('searchPlaceholder', language)}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  <Search size={20} />
                </button>
              </form>

              {isSearchOpen && (
                <div className={styles.searchDropdown}>
                  {searchTerm && (
                    <div className={styles.dropdownSection}>
                      <div className={`${styles.dropdownItem} ${styles.searchFor}`}>
                        <Search size={16} />
                        <span>{getTranslation('searchFor', language)} "{searchTerm}"</span>
                      </div>
                    </div>
                  )}

                  {searchTerm && searchResults.products.length > 0 && (
                    <div className={styles.dropdownSection}>
                      <h4>{getTranslation('products', language)}</h4>
                      {searchResults.products.map(product => (
                        <Link 
                          key={product._id} 
                          to={`/product/${product._id}`}
                          className={styles.productDropdownItem}
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <img src={product.image} alt={product.name} />
                          <div className={styles.productInfo}>
                            <span className={styles.productName}>{product.name}</span>
                            <span className={styles.productPrice}>{product.price}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchTerm && searchResults.categories.length > 0 && (
                    <div className={styles.dropdownSection}>
                      <h4>{getTranslation('categories', language)}</h4>
                      {searchResults.categories.map(category => (
                        <Link 
                          key={category._id} 
                          to={`/category/${getStandardizedCategorySlug(category.name)}`}
                          className={styles.dropdownItem}
                          onClick={() => setIsSearchOpen(false)}
                        >
                          <span>{category.name} ({category.productCount} {getTranslation('products', language)})</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {isSearching && (
                    <div className={styles.dropdownSection}>
                      <div className={styles.dropdownItem}>
                        <span>{getTranslation('searching', language)}...</span>
                      </div>
                    </div>
                  )}

                  {!searchTerm && recentSearches.length > 0 && (
                    <div className={styles.dropdownSection}>
                      <h4><Clock size={16} /> {getTranslation('recentSearches', language)}</h4>
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className={styles.dropdownItem}
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <Clock size={16} />
                          <span>{search}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searchTerm && trendingSearches.length > 0 && (
                    <div className={styles.dropdownSection}>
                      <h4><TrendingUp size={16} /> {getTranslation('trendingSearches', language)}</h4>
                      {trendingSearches.slice(0, 6).map((search, index) => (
                        <div
                          key={index}
                          className={styles.dropdownItem}
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <TrendingUp size={16} />
                          <span>{search}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.headerActions}>
              <Link to="/favorites" className={styles.actionItem}>
                <Heart size={24} />
                <span>{t('favorites') || 'Favorites'}</span>
                {favoritesCount > 0 && <span className={styles.favoritesCount}>{favoritesCount}</span>}
              </Link>
              
              <div className={`${styles.actionItem} ${styles.userMenuContainer}`} ref={userMenuRef}>
                <div className={styles.actionItem} onClick={handleUserClick}>
                  <User size={24} />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{isAuthenticated ? user?.firstName || t('myAccount') : t('signIn')}</span>
                    {isAuthenticated && <ChevronDown size={16} />}
                  </div>
                </div>
                
                {isAuthenticated && showUserMenu && (
                  <div className={styles.userDropdown}>
                    <div className={styles.userInfo}>
                      <div className={styles.userAvatar}>
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.fullName} />
                        ) : (
                          <div className={styles.avatarPlaceholder}>
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className={styles.userDetails}>
                        <h4>{user?.fullName}</h4>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                      <User size={16} />
                      {t('profile')}
                    </Link>
                    <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                      <Package size={16} />
                      {t('myOrders')}
                    </Link>
                    <div className={styles.dropdownDivider}></div>
                    <button onClick={handleLogout}>
                      <LogOut size={16} />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
              
              <div className={`${styles.actionItem} ${styles.cart}`}>
                <ShoppingCart size={24} />
                <span>{t('cart') || 'Cart'}</span>
                <span className={styles.cartCount}>0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className={styles.headerNav}>
        <div className={styles.container}>
          <ul className={styles.navMenu}>
            {categories.map((category, index) => {
              const categorySlug = getStandardizedCategorySlug(category.name);
              return (
                <li key={index}>
                  <Link to={`/category/${categorySlug}`}>
                    {category.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </header>
  );
};

export default Header;