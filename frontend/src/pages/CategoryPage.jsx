import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Truck, Shield } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import FavoriteButton from '../components/Common/FavoriteButton';
import ApiService from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import styles from './CategoryPage.module.css';

const CategoryPage = () => {
  const { category } = useParams();
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  usePageTitle('categoryPageTitle', categoryName);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getProductsByCategory(category, language);
        setProducts(data.products);
        setCategoryName(data.categoryName || capitalizeCategory(category));
      } catch (err) {
        console.error('Failed to fetch category products:', err);
        setError(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category, language]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const capitalizeCategory = (cat) => {
    return cat.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className={styles.categoryPage}>
        <div className="container">
          <div className={styles.loadingPlaceholder}>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className={styles.categoryPage}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{categoryName || capitalizeCategory(category)}</span>
          </nav>
          <div className={styles.errorMessage}>
            <h2>No products found</h2>
            <p>Sorry, no products are available in this category.</p>
            <Link to="/" className={styles.backHomeBtn}>Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoryPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{capitalizeCategory(category)}</span>
        </nav>

        {/* Category Header */}
        <div className={styles.categoryHeader}>
          <h1>{categoryName || capitalizeCategory(category)}</h1>
          <p>{products.length} {products.length === 1 ? 'product' : 'products'} found</p>
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product._id || product.id} className={styles.productCard}>
              <div className={styles.productActions}>
                <FavoriteButton 
                  product={product} 
                  size={18}
                  className={`${styles.actionBtn} ${styles.favorite}`}
                />
                <button className={`${styles.actionBtn} ${styles.view}`}>
                  <Eye 
                    size={18} 
                    width={18} 
                    height={18} 
                    strokeWidth={1.5}
                    style={{ width: '18px', height: '18px', display: 'block' }}
                  />
                </button>
              </div>

              <div className={styles.productImage}>
                <img src={product.image} alt={product.name} />
              </div>

              <div className={styles.productInfo}>
                <div className={styles.productCategory}>{product.category}</div>
                <Link to={`/product/${product._id || product.id}`} className={styles.productNameLink}>
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
                    <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <>
                        <span className={styles.oldPrice}>{formatPrice(product.originalPrice)}</span>
                        <span className={styles.discount}>
                          {product.discount}% {getTranslation('off', language)}
                        </span>
                      </>
                    )}
                  </div>
                  {!product.inStock && (
                    <div className={styles.outOfStockRow}>
                      <span className={styles.outOfStockBadge}>
                        {getTranslation('outOfStock', language)}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.productBenefits}>
                  <div className={styles.benefit}>
                    <Truck size={14} />
                    <span>{getTranslation('freeShipping', language)}</span>
                  </div>
                  <div className={styles.benefit}>
                    <Shield size={14} />
                    <span>{getTranslation('yearWarranty', language)}</span>
                  </div>
                </div>

                <button 
                  className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
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
    </div>
  );
};

export default CategoryPage;