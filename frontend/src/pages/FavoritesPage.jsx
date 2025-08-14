import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import FavoriteButton from '../components/Common/FavoriteButton';
import usePageTitle from '../hooks/usePageTitle';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { favorites, clearFavorites, loading } = useFavorites();
  const { language } = useLanguage();

  usePageTitle('favoritesPageTitle');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleClearAll = () => {
    if (window.confirm(getTranslation('confirmClearFavorites', language) || 'Are you sure you want to clear all favorites?')) {
      clearFavorites();
    }
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="container">
          <div className="loading-placeholder">
            <p>{getTranslation('loading', language)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">
            <ArrowLeft size={16} />
            {getTranslation('home', language)}
          </Link>
          <span>/</span>
          <span>{getTranslation('favorites', language) || 'Favorites'}</span>
        </nav>

        {/* Page Header */}
        <div className="favorites-header">
          <div className="header-content">
            <div className="header-left">
              <Heart size={32} className="page-icon" />
              <div>
                <h1>{getTranslation('favorites', language) || 'My Favorites'}</h1>
                <p className="favorites-count">
                  {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            {favorites.length > 0 && (
              <button className="clear-all-btn" onClick={handleClearAll}>
                <Trash2 size={16} />
                {getTranslation('clearAll', language) || 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Favorites Content */}
        {favorites.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-favorites-content">
              <Heart size={64} className="empty-icon" />
              <h2>{getTranslation('noFavorites', language) || 'No favorites yet'}</h2>
              <p>{getTranslation('noFavoritesDescription', language) || 'Start adding products you love to see them here.'}</p>
              <Link to="/" className="continue-shopping-btn">
                {getTranslation('continueShopping', language) || 'Continue Shopping'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((product) => (
              <div key={product._id || product.id} className="favorite-item">
                <div className="product-image-container">
                  <Link to={`/product/${product._id || product.id}`}>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </Link>
                  <div className="favorite-overlay">
                    <FavoriteButton product={product} className="overlay-favorite" />
                  </div>
                  {product.discount && (
                    <div className="product-badge">
                      {product.discount}% OFF
                    </div>
                  )}
                </div>

                <div className="product-info">
                  <div className="product-category">{product.category}</div>
                  
                  <Link to={`/product/${product._id || product.id}`} className="product-name-link">
                    <h3 className="product-name">{product.name}</h3>
                  </Link>
                  
                  <p className="product-description">{product.description}</p>
                  
                  {product.rating && (
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
                        {product.rating} ({product.reviews || 0} {getTranslation('reviews', language)})
                      </span>
                    </div>
                  )}

                  <div className="product-pricing">
                    <div className="price-row">
                      <span className="current-price">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <>
                          <span className="old-price">{formatPrice(product.originalPrice)}</span>
                          <span className="discount-badge">
                            {getTranslation('saveAmount', language)} {formatPrice(product.originalPrice - product.price)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="product-actions">
                    <button 
                      className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart size={18} />
                      {product.inStock 
                        ? getTranslation('addToCart', language) 
                        : getTranslation('outOfStock', language)
                      }
                    </button>
                  </div>
                  
                  {!product.inStock && (
                    <div className="stock-status">
                      <span className="out-of-stock-badge">
                        {getTranslation('outOfStock', language)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;