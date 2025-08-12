import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, User, MapPin, Phone, Heart, TrendingUp, Clock, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import './Header.css';

const Header = () => {
  const { language, changeLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches] = useState(['iPhone 15', 'MacBook Pro', 'Samsung TV']);
  const searchRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
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
                <span>{getTranslation('favorites', language)}</span>
              </div>
              <div className="action-item">
                <User size={24} />
                <span>{getTranslation('myAccount', language)}</span>
              </div>
              <div className="action-item cart">
                <ShoppingCart size={24} />
                <span>{getTranslation('cart', language)}</span>
                <span className="cart-count">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <div className="container">
          <ul className="nav-menu">
            <li><a href="#phone">{getTranslation('phone', language)}</a></li>
            <li><a href="#computer">{getTranslation('computer', language)}</a></li>
            <li><a href="#tv">{getTranslation('tvAudio', language)}</a></li>
            <li><a href="#appliances">{getTranslation('appliances', language)}</a></li>
            <li><a href="#small-appliances">{getTranslation('smallAppliances', language)}</a></li>
            <li><a href="#air-conditioners">{getTranslation('airConditioners', language)}</a></li>
            <li><a href="#gaming">{getTranslation('gaming', language)}</a></li>
            <li><a href="#sports">{getTranslation('sports', language)}</a></li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;