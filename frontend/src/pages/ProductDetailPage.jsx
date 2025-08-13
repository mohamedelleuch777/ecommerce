import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslation } from '../utils/translations';
import ApiService from '../services/api';
import './ProductDetailPage.css';

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await ApiService.getProductById(id, language);
        setProduct(data);
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
        <div className="loading-placeholder pdp-loading">
          <p>{getTranslation('loading', language)}</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/" className="back-home-btn">
            {getTranslation('backToHome', language)}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">{getTranslation('home', language)}</Link>
          <span>/</span>
          <Link to={`/category/${product.category.toLowerCase()}`}>{product.category}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-content">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images ? product.images[selectedImageIndex] : product.image} 
                alt={product.name} 
              />
              {product.images && product.images.length > 1 && (
                <>
                  <button 
                    className="image-nav prev"
                    onClick={() => handleImageChange('prev')}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    className="image-nav next"
                    onClick={() => handleImageChange('next')}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              {product.discount > 0 && (
                <div className="product-badge discount">
                  {product.discount}% {getTranslation('off', language)}
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <button className="favorite-btn">
                <Heart size={24} />
              </button>
            </div>

            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                    stroke={i < Math.floor(product.rating) ? '#ffc107' : '#ddd'}
                  />
                ))}
              </div>
              <span className="rating-text">
                {product.rating} ({product.reviews} {getTranslation('reviews', language)})
              </span>
            </div>

            <div className="product-pricing">
              <div className="price-row">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <>
                    <span className="old-price">{formatPrice(product.originalPrice)}</span>
                    <span className="discount">
                      {getTranslation('saveAmount', language)} {formatPrice(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>
              {!product.inStock && (
                <div className="stock-status">
                  <span className="out-of-stock-badge">
                    {getTranslation('outOfStock', language)}
                  </span>
                </div>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-features">
              <div className="feature">
                <Truck size={20} />
                <span>{getTranslation('freeShippingTitle', language)}</span>
              </div>
              <div className="feature">
                <Shield size={20} />
                <span>{getTranslation('yearWarranty', language)}</span>
              </div>
              <div className="feature">
                <RotateCcw size={20} />
                <span>{getTranslation('easyReturnTitle', language)}</span>
              </div>
            </div>

            <div className="product-actions">
              {/* Color Selector */}
              <div className="option-selector color-selector">
                <label>Color:</label>
                <div className="color-options">
                  <button 
                    className={`color-option black ${selectedColor === 'black' ? 'selected' : ''}`}
                    onClick={() => setSelectedColor('black')}
                    style={{ backgroundColor: '#000' }}
                  >
                  </button>
                  <button 
                    className={`color-option white ${selectedColor === 'white' ? 'selected' : ''}`}
                    onClick={() => setSelectedColor('white')}
                    style={{ backgroundColor: '#fff', border: '2px solid #ddd' }}
                  >
                  </button>
                  <button 
                    className={`color-option blue ${selectedColor === 'blue' ? 'selected' : ''}`}
                    onClick={() => setSelectedColor('blue')}
                    style={{ backgroundColor: '#2563eb' }}
                  >
                  </button>
                  <button 
                    className={`color-option red ${selectedColor === 'red' ? 'selected' : ''}`}
                    onClick={() => setSelectedColor('red')}
                    style={{ backgroundColor: '#dc2626' }}
                  >
                  </button>
                </div>
              </div>

              {/* Size Selector */}
              <div className="option-selector size-selector">
                <label>Size:</label>
                <div className="size-options">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <button 
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Details Selector */}
              <div className="option-selector details-selector">
                <label>Memory/Storage:</label>
                <div className="details-options">
                  {['128GB', '256GB', '512GB', '1TB'].map(detail => (
                    <button 
                      key={detail}
                      className={`details-option ${selectedDetails === detail ? 'selected' : ''}`}
                      onClick={() => setSelectedDetails(detail)}
                    >
                      {detail}
                    </button>
                  ))}
                </div>
              </div>

              <div className="quantity-selector">
                <label>{getTranslation('quantity', language)}:</label>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange(-1)}>
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <button 
                className={`add-to-cart-btn primary ${!product.inStock ? 'disabled' : ''}`}
                disabled={!product.inStock}
              >
                <ShoppingCart size={20} />
                {product.inStock ? getTranslation('addToCart', language) : getTranslation('outOfStock', language)}
              </button>
            </div>

            <div className="stock-status">
              {product.inStock ? (
                <span className="in-stock">{getTranslation('inStock', language)}</span>
              ) : (
                <span className="out-of-stock">{getTranslation('outOfStock', language)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="product-details-tabs">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              {getTranslation('description', language)}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              {getTranslation('specifications', language)}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              {getTranslation('reviews', language)} ({product.reviews})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="tab-panel">
                <p>{product.detailedDescription || product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-panel">
                <div className="specifications">
                  {product.specifications ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-row">
                        <span className="spec-label">{key}:</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p>{getTranslation('noSpecifications', language)}</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-panel">
                <div className="reviews-section">
                  <div className="reviews-summary">
                    <div className="overall-rating">
                      <div className="rating-number">{product.rating}</div>
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < Math.floor(product.rating) ? '#ffc107' : 'none'}
                            stroke={i < Math.floor(product.rating) ? '#ffc107' : '#ddd'}
                          />
                        ))}
                      </div>
                      <div className="reviews-count">{product.reviews} {getTranslation('reviews', language)}</div>
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