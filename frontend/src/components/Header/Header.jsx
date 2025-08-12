import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, Phone, Heart, TrendingUp, Clock, Globe, LogOut, Package, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getTranslation } from '../../utils/translations';
import ApiService from '../../services/api';
import LoginModal from '../Auth/LoginModal';
import './Header.css';

const Header = () => {
  const { language, changeLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [recentSearches] = useState(['iPhone 15', 'MacBook Pro', 'Samsung TV']);
  const [categories, setCategories] = useState([]);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  const trendingSearches = [
    'iPhone 15 Pro Max',
    'PlayStation 5',
    'MacBook Air M2',
    'Samsung Galaxy S24',
    'AirPods Pro',
    'Gaming Laptop',
    'Wireless Headphones',
    'Smart Watch'
  ];

  const productSuggestions = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB',
      price: '$1,199',
      image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=100&q=80'
    },
    {
      id: 2,
      name: 'MacBook Pro M3 14"',
      price: '$1,999',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100&q=80'
    },
    {
      id: 3,
      name: 'Samsung QLED 75" TV',
      price: '$899',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&q=80'
    }
  ];

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      setIsSearchOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setIsSearchOpen(false);
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

  const filteredSuggestions = trendingSearches.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = productSuggestions.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-left">
            <span className="location">
              <MapPin size={16} />
              {getTranslation('storeFinder', language)}
            </span>
            <span className="phone">
              <Phone size={16} />
              +1 (555) 123-4567
            </span>
          </div>
          <div className="header-top-right">
            <span>{getTranslation('campaigns', language)}</span>
            <span>{getTranslation('corporate', language)}</span>
            <span>{getTranslation('help', language)}</span>
            <div className="language-switcher">
              <Globe size={16} />
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-select"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>{getTranslation('brandName', language)}</h1>
            </div>

            <div className="search-container" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="search-box">
                <input
                  type="text"
                  placeholder={getTranslation('searchPlaceholder', language)}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </form>

              {isSearchOpen && (
                <div className="search-dropdown">
                  {searchTerm && (
                    <div className="dropdown-section">
                      <div className="dropdown-item search-for">
                        <Search size={16} />
                        <span>{getTranslation('searchFor', language)} "{searchTerm}"</span>
                      </div>
                    </div>
                  )}

                  {searchTerm && filteredProducts.length > 0 && (
                    <div className="dropdown-section">
                      <h4>{getTranslation('products', language)}</h4>
                      {filteredProducts.map(product => (
                        <div key={product.id} className="product-dropdown-item">
                          <img src={product.image} alt={product.name} />
                          <div className="product-info">
                            <span className="product-name">{product.name}</span>
                            <span className="product-price">{product.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!searchTerm && recentSearches.length > 0 && (
                    <div className="dropdown-section">
                      <h4><Clock size={16} /> {getTranslation('recentSearches', language)}</h4>
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="dropdown-item"
                          onClick={() => handleSuggestionClick(search)}
                        >
                          <Clock size={16} />
                          <span>{search}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="dropdown-section">
                    <h4><TrendingUp size={16} /> {getTranslation('trendingSearches', language)}</h4>
                    {(searchTerm ? filteredSuggestions : trendingSearches.slice(0, 6)).map((search, index) => (
                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        <TrendingUp size={16} />
                        <span>{search}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="header-actions">
              <div className="action-item">
                <Heart size={24} />
                <span>{t('favorites') || 'Favorites'}</span>
              </div>
              
              <div className="action-item user-menu-container" ref={userMenuRef}>
                <div className="action-item" onClick={handleUserClick}>
                  <User size={24} />
                  <span>{isAuthenticated ? user?.firstName || t('myAccount') : t('signIn')}</span>
                  {isAuthenticated && <ChevronDown size={16} />}
                </div>
                
                {isAuthenticated && showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.fullName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <h4>{user?.fullName}</h4>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/profile" onClick={() => setShowUserMenu(false)}>
                      <User size={16} />
                      {t('profile')}
                    </Link>
                    <Link to="/orders" onClick={() => setShowUserMenu(false)}>
                      <Package size={16} />
                      {t('myOrders')}
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout}>
                      <LogOut size={16} />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="action-item cart">
                <ShoppingCart size={24} />
                <span>{t('cart') || 'Cart'}</span>
                <span className="cart-count">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="container">
          <ul className="nav-menu">
            {categories.map((category, index) => {
              const categorySlug = category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
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