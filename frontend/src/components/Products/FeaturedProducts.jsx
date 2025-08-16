import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Truck, Shield } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './FeaturedProducts.module.css';
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
      <section className={styles.featuredProducts}>
        <div className="container">
          <div className={styles.loadingPlaceholder}>
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
    <section className={styles.featuredProducts}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{getTranslation('featuredProducts', language)}</h2>
          <p>{getTranslation('featuredSubtitle', language)}</p>
        </div>

        <div className={styles.dealsSection}>
          <div className={styles.dealsHeader}>
            <h3>{getTranslation('featuredProducts', language)}</h3>
            <div className={styles.countdown}>
              <span className={styles.countdownLabel}>{getTranslation('specialOffers', language)}</span>
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
            className={styles.productsSwiper}
          >
            {featuredProducts.map((product) => (
              <SwiperSlide key={product._id || product.id}>
                <div className={styles.productCard}>
                  
                  <div className={styles.productActions}>
                    <FavoriteButton 
                      product={product} 
                      size={18}
                      className={`${styles.actionBtn} ${styles.favorite}`}
                    />
                    <button className={`${styles.actionBtn} ${styles.view}`} style={{ padding: 0, margin: 0 }}>
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
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={styles.viewAllSection}>
          <button className={styles.viewAllBtn}>{getTranslation('viewAllProducts', language)}</button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;