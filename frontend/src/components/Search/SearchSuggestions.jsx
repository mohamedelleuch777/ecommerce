import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, Clock } from 'lucide-react';
import styles from './SearchSuggestions.module.css';

const SearchSuggestions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
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

  const categories = [
    { name: 'Telefon & Tablet', count: 1250 },
    { name: 'Bilgisayar & Laptop', count: 890 },
    { name: 'TV & Ses Sistemleri', count: 456 },
    { name: 'Beyaz Eşya', count: 234 },
    { name: 'Gaming', count: 678 }
  ];

  const productSuggestions = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB',
      price: '₺54.999',
      image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=100&q=80'
    },
    {
      id: 2,
      name: 'MacBook Pro M3 14"',
      price: '₺89.999',
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100&q=80'
    },
    {
      id: 3,
      name: 'Samsung QLED 75" TV',
      price: '₺24.999',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100&q=80'
    }
  ];

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      console.log('Searching for:', searchTerm);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
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
    <div className={styles.searchSuggestionsContainer} ref={searchRef}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <input
            type="text"
            placeholder="Ürün, marka veya kategori arayın..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={styles.searchInputMain}
          />
          <button type="submit" className={styles.searchButtonMain}>
            <Search size={20} />
          </button>
        </div>
      </form>

      {isOpen && (
        <div className={styles.suggestionsDropdown}>
          {searchTerm && (
            <div className={styles.suggestionsSection}>
              <div className={`${styles.suggestionItem} ${styles.searchFor}`}>
                <Search size={16} />
                <span>"{searchTerm}" için ara</span>
              </div>
            </div>
          )}

          {searchTerm && filteredProducts.length > 0 && (
            <div className={styles.suggestionsSection}>
              <h4>Ürünler</h4>
              {filteredProducts.map(product => (
                <div key={product._id || product.id} className={styles.productSuggestion}>
                  <img src={product.image} alt={product.name} />
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{product.name}</span>
                    <span className={styles.productPrice}>{product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searchTerm && recentSearches.length > 0 && (
            <div className={styles.suggestionsSection}>
              <h4><Clock size={16} /> Son Aramalarınız</h4>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className={styles.suggestionItem}
                  onClick={() => handleSuggestionClick(search)}
                >
                  <Clock size={16} />
                  <span>{search}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.suggestionsSection}>
            <h4><TrendingUp size={16} /> Popüler Aramalar</h4>
            {(searchTerm ? filteredSuggestions : trendingSearches.slice(0, 6)).map((search, index) => (
              <div
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(search)}
              >
                <TrendingUp size={16} />
                <span>{search}</span>
              </div>
            ))}
          </div>

          {!searchTerm && (
            <div className={styles.suggestionsSection}>
              <h4>Kategoriler</h4>
              {categories.map((category, index) => (
                <div key={index} className={styles.categoryItem}>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>({category.count})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;