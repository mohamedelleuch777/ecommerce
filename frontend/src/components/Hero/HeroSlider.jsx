import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useLanguage } from '../../hooks/useLanguage';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './HeroSlider.module.css';
import ApiService from '../../services/api';

const HeroSlider = () => {
  const { language } = useLanguage();
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await ApiService.getHeroData(language);
        setHeroData(data);
      } catch (err) {
        console.error('Failed to fetch hero data:', err);
        // Fallback data if API fails
        setHeroData({
          slides: [
            {
              id: 1,
              title: "Discover Amazing Products",
              subtitle: "Shop the latest trends",
              image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&q=80",
              buttonText: "Shop Now"
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, [language]);

  if (loading) {
    return (
      <section className={styles.heroSlider}>
        <div className={styles.loadingPlaceholder}>
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  const slides = heroData?.slides || [];

  return (
    <section className={styles.heroSlider}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={true}
        className={styles.heroSwiper}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div 
              className={styles.slideContent}
              style={{ 
                background: slide.backgroundImage 
                  ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${slide.backgroundImage})` 
                  : slide.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="container">
                <div className={styles.slideInfo}>
                  <div className={styles.slideText}>
                    <h2 className={styles.slideTitle}>{slide.title}</h2>
                    <p className={styles.slideSubtitle}>{slide.subtitle}</p>
                    {slide.description && (
                      <p className={styles.slideDescription}>{slide.description}</p>
                    )}
                    {slide.currentPrice && (
                      <div className={styles.slidePricing}>
                        <span className={styles.currentPrice}>${slide.currentPrice}</span>
                        {slide.oldPrice && (
                          <>
                            <span className={styles.oldPrice}>${slide.oldPrice}</span>
                            {slide.discount && (
                              <span className={styles.discount}>{slide.discount}% OFF</span>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <button className={styles.ctaButton}>{slide.buttonText}</button>
                  </div>
                  
                  <div className={styles.slideImage}>
                    <img src={slide.productImage || slide.image} alt={slide.title} />
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;