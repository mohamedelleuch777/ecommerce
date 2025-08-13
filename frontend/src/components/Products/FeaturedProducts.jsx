import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Truck, Shield } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './FeaturedProducts.css';
import { useLanguage } from '../../hooks/useLanguage';
import { getTranslation } from '../../utils/translations';
import FavoriteButton from '../Common/FavoriteButton';
import ApiService from '../../services/api';

const FeaturedProducts = () => {
  const { language } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await ApiService.getFeaturedProducts(language);
        setFeaturedProducts(data);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        // Fallback data if API fails
        setFeaturedProducts([
          {
            id: 1,
            name: 'Sample Product',
            description: 'Sample description',
            price: 99.99,
            originalPrice: 149.99,
            discount: 33,
            image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&q=80',
            category: 'Electronics',
            rating: 4.5,
            reviews: 100,
            inStock: true,
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [language]);

  if (loading) {
    return (
      <section className="featured-products">
        <div className="container">
          <div className="loading-placeholder">
            <p>{getTranslation('loadingProducts', language)}</p>
          </div>
        </div>
      </section>
    );
  }

  

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <h2>{getTranslation('featuredProducts', language)}</h2>
          <p>{getTranslation('featuredSubtitle', language)}</p>
        </div>

        <div className="deals-section">
          <div className="deals-header">
            <h3>{getTranslation('featuredProducts', language)}</h3>
            <div className="countdown">
              <span className="countdown-label">{getTranslation('specialOffers', language)}</span>
            </div>
          </div>

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={25}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 15
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 20
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 25
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 25
              },
              1200: {
                slidesPerView: 5,
                spaceBetween: 25
              },
              1400: {
                slidesPerView: 6,
                spaceBetween: 25
              }
            }}
            className="products-swiper"
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product._id || product.id}>
                <div className="product-card">
                  
                  <div className="product-actions">
                    <FavoriteButton 
                      product={product} 
                      size={18}
                      className="action-btn favorite"
                    />
                    <button className="action-btn view" style={{ padding: 0, margin: 0 }}>
                      <Eye 
                        size={18} 
                        width={18} 
                        height={18} 
                        strokeWidth={1.5}
                        style={{ width: '18px', height: '18px', display: 'block' }}
                      />
                    </button>
                  </div>

                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="product-info">
                    <div className="product-category">{product.category}</div>
                    <Link to={`/product/${product._id || product.id}`} className="product-name-link">
                      <h4 className="product-name">{product.name}</h4>
                    </Link>
                    <p className="product-description">{product.description}</p>
                    
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
                              {product.discount}% {getTranslation('off', language)}
                            </span>
                          </>
                        )}
                      </div>
                      {!product.inStock && (
                        <div className="out-of-stock-row">
                          <span className="out-of-stock-badge">
                            {getTranslation('outOfStock', language)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="product-benefits">
                      <div className="benefit">
                        <Truck size={14} />
                        <span>{getTranslation('freeShipping', language)}</span>
                      </div>
                      <div className="benefit">
                        <Shield size={14} />
                        <span>{getTranslation('yearWarranty', language)}</span>
                      </div>
                    </div>

                    <button 
                      className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart size={18} />
                      {product.inStock ? getTranslation('addToCart', language) : getTranslation('outOfStock', language)}
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="view-all-section">
          <button className="view-all-btn">{getTranslation('viewAllProducts', language)}</button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;