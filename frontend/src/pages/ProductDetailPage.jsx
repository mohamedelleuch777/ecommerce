import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import FavoriteButton from '../components/Common/FavoriteButton';
import AddToCartButton from '../components/Cart/AddToCartButton';
import ApiService from '../services/api';
import usePageTitle from '../hooks/usePageTitle';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedDetails, setSelectedDetails] = useState('');

  usePageTitle('productPageTitle', product?.name);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await ApiService.getProductById(id, language);
        setProduct(data);
        
        // Track product view for recommendations
        try {
          await ApiService.trackProductView(id, data.category);
        } catch (trackError) {
          console.error('Failed to track product view:', trackError);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, language]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const handleQuantityChange = (delta) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleImageChange = (direction) => {
    if (!product?.images) return;
    const newIndex = direction === 'next' 
      ? (selectedImageIndex + 1) % product.images.length
      : selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
  };

  if (loading) {
    return (
      <div className="container">
        <div className={`loading-placeholder ${styles.pdpLoading}`}>
          <p>{getTranslation('loading', language)}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className={styles.errorMessage}>
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/" className={styles.backHomeBtn}>
            {getTranslation('backToHome', language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.productDetailPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/">{getTranslation('home', language)}</Link>
          <span>/</span>
          <Link to={`/category/${product.category.toLowerCase()}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className={styles.productDetailContent}>
          {/* Product Images */}
          <div className={styles.productImages}>
            <div className={styles.mainImage}>
              <img 
                src={product.images ? product.images[selectedImageIndex] : product.image} 
                alt={product.name} 
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    className={`${styles.imageNav} ${styles.prev}`}
                    onClick={() => handleImageChange('prev')}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className={`${styles.imageNav} ${styles.next}`}
                    onClick={() => handleImageChange('next')}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              {product.discount > 0 && (
                <div className={`${styles.productBadge} ${styles.discount}`}>
                  {product.discount}% {getTranslation('off', language)}
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className={styles.imageThumbnails}>
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.active : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.productHeader}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              <FavoriteButton 
                product={product} 
                size={24}
                className={`${styles.favoriteBtn} ${styles.large}`}
              />
            </div>

            <div className={styles.productRating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
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
                      {getTranslation('saveAmount', language)} {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
              {!product.inStock && (
                <div className={styles.stockStatus}>
                  <span className={styles.outOfStockBadge}>
                    {getTranslation('outOfStock', language)}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.productDescription}>
              <p>{product.description}</p>
            </div>

            <div className={styles.productFeatures}>
              <div className={styles.feature}>
                <Truck size={20} />
                <span>{getTranslation('freeShippingTitle', language)}</span>
              </div>
              <div className={styles.feature}>
                <Shield size={20} />
                <span>{getTranslation('yearWarranty', language)}</span>
              </div>
              <div className={styles.feature}>
                <RotateCcw size={20} />
                <span>{getTranslation('easyReturnTitle', language)}</span>
              </div>
            </div>

            <div className={styles.productActions}>
              {/* Color Selector */}
              <div className={`${styles.optionSelector} ${styles.colorSelector}`}>
                <label>Color:</label>
                <div className={styles.colorOptions}>
                  <button 
                    className={`${styles.colorOption} ${styles.black} ${selectedColor === 'black' ? styles.selected : ''}`}
                    onClick={() => setSelectedColor('black')}
                    style={{ backgroundColor: '#000' }}
                  >
                  </button>
                  <button 
                    className={`${styles.colorOption} ${styles.white} ${selectedColor === 'white' ? styles.selected : ''}`}
                    onClick={() => setSelectedColor('white')}
                    style={{ backgroundColor: '#fff', border: '2px solid #ddd' }}
                  >
                  </button>
                  <button 
                    className={`${styles.colorOption} ${styles.blue} ${selectedColor === 'blue' ? styles.selected : ''}`}
                    onClick={() => setSelectedColor('blue')}
                    style={{ backgroundColor: '#2563eb' }}
                  >
                  </button>
                  <button 
                    className={`${styles.colorOption} ${styles.red} ${selectedColor === 'red' ? styles.selected : ''}`}
                    onClick={() => setSelectedColor('red')}
                    style={{ backgroundColor: '#dc2626' }}
                  >
                  </button>
                </div>
              </div>

              {/* Size Selector */}
              <div className={`${styles.optionSelector} ${styles.sizeSelector}`}>
                <label>Size:</label>
                <div className={styles.sizeOptions}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button 
                      key={size}
                      className={`${styles.sizeOption} ${selectedSize === size ? styles.selected : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Selector */}
              <div className={`${styles.optionSelector} ${styles.detailsSelector}`}>
                <label>Memory/Storage:</label>
                <div className={styles.detailsOptions}>
                  {['128GB', '256GB', '512GB', '1TB'].map(detail => (
                    <button 
                      key={detail}
                      className={`${styles.detailsOption} ${selectedDetails === detail ? styles.selected : ''}`}
                      onClick={() => setSelectedDetails(detail)}
                    >
                      {detail}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.quantitySelector}>
                <label>{getTranslation('quantity', language)}:</label>
                <div className={styles.quantityControls}>
                  <button onClick={() => handleQuantityChange(-1)}>
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <AddToCartButton 
                product={product}
                size="large"
                variant="primary"
                showQuantityControls={false}
                className={styles.addToCartBtn}
                onSuccess={(product, quantity) => {
                  console.log(`Added ${quantity} of ${product.name} to cart`);
                  // You could show a toast notification here
                }}
                onError={(error) => {
                  console.error('Failed to add to cart:', error);
                  // You could show an error notification here
                }}
              />
            </div>

            <div className={styles.stockStatus}>
              {product.inStock ? (
                <span className={styles.inStock}>{getTranslation('inStock', language)}</span>
              ) : (
                <span className={styles.outOfStock}>{getTranslation('outOfStock', language)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className={styles.productDetailsTabs}>
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'description' ? styles.active : ''}`}
              onClick={() => setActiveTab('description')}
            >
              {getTranslation('description', language)}
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'specifications' ? styles.active : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              {getTranslation('specifications', language)}
            </button>
            <button 
              className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              {getTranslation('reviews', language)} ({product.reviews})
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.tabPanel}>
                <p>{product.detailedDescription || product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className={styles.tabPanel}>
                <div className={styles.specifications}>
                  {product.specifications ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className={styles.specRow}>
                        <span className={styles.specLabel}>{key}:</span>
                        <span className={styles.specValue}>{value}</span>
                      </div>
                    ))
                  ) : (
                    <p>{getTranslation('noSpecifications', language)}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.tabPanel}>
                <div className={styles.reviewsSection}>
                  <div className={styles.reviewsSummary}>
                    <div className={styles.overallRating}>
                      <div className={styles.ratingNumber}>{product.rating}</div>
                      <div className={styles.stars}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                            stroke={i < Math.floor(product.rating) ? '#ffc107' : '#ddd'}
                          />
                        ))}
                      </div>
                      <div className={styles.reviewsCount}>{product.reviews} {getTranslation('reviews', language)}</div>
                    </div>
                  </div>
                  <p>{getTranslation('reviewsComingSoon', language)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailPage;