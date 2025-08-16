import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Trash2, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import FavoriteButton from '../components/Common/FavoriteButton';
import usePageTitle from '../hooks/usePageTitle';
import styles from './FavoritesPage.module.css';

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
      <div className={styles.favoritesPage}>
        <div className="container">
          <div className={styles.loadingPlaceholder}>
            <p>{getTranslation('loading', language)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage}>
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
        <div className={styles.favoritesHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <Heart size={32} className={styles.pageIcon} />
              <div>
                <h1>{getTranslation('favorites', language) || 'My Favorites'}</h1>
                <p className={styles.favoritesCount}>
                  {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
            {favorites.length > 0 && (
              <button className={styles.clearAllBtn} onClick={handleClearAll}>
                <Trash2 size={16} />
                {getTranslation('clearAll', language) || 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* Favorites Content */}
        {favorites.length === 0 ? (
          <div className={styles.emptyFavorites}>
            <div className={styles.emptyFavoritesContent}>
              <Heart size={64} className={styles.emptyIcon} />
              <h2>{getTranslation('noFavorites', language) || 'No favorites yet'}</h2>
              <p>{getTranslation('noFavoritesDescription', language) || 'Start adding products you love to see them here.'}</p>
              <Link to="/" className={styles.continueShoppingBtn}>
                {getTranslation('continueShopping', language) || 'Continue Shopping'}
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.favoritesGrid}>
            {favorites.map((product) => (
              <div key={product._id || product.id} className={styles.favoriteItem}>
                <div className={styles.productImageContainer}>
                  <Link to={`/product/${product._id || product.id}`}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </Link>
                  <div className={styles.favoriteOverlay}>
                    <FavoriteButton product={product} className={styles.overlayFavorite} />
                  </div>
                  {product.discount && (
                    <div className={styles.productBadge}>
                      {product.discount}% OFF
                    </div>
                  )}
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.productCategory}>{product.category}</div>
                  
                  <Link to={`/product/${product._id || product.id}`} className={styles.productNameLink}>
                    <h3 className={styles.productName}>{product.name}</h3>
                  </Link>
                  
                  <p className={styles.productDescription}>{product.description}</p>
                  
                  {product.rating && (
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
                        {product.rating} ({product.reviews || 0} {getTranslation('reviews', language)})
                      </span>
                    </div>
                  )}

                  <div className={styles.productPricing}>
                    <div className={styles.priceRow}>
                      <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <>
                          <span className={styles.oldPrice}>{formatPrice(product.originalPrice)}</span>
                          <span className={styles.discountBadge}>
                            {getTranslation('saveAmount', language)} {formatPrice(product.originalPrice - product.price)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className={styles.productActions}>
                    <button 
                      className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
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
                    <div className={styles.stockStatus}>
                      <span className={styles.outOfStockBadge}>
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