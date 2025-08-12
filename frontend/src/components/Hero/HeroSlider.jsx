import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useLanguage } from '../../contexts/LanguageContext';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './HeroSlider.css';
import ApiService from '../../services/api';

const HeroSlider = () => {
  const { language } = useLanguage();
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await ApiService.getHeroData(language);
        setHeroData(data);
      } catch (err) {
        console.error('Failed to fetch hero data:', err);
        setError(err);
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
      <section className="hero-slider">
        <div className="loading-placeholder">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  const slides = heroData?.slides || [];

  return (
    <section className="hero-slider">
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
        className="hero-swiper"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="slide-content" style={{ background: slide.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="container">
                <div className="slide-info">
                  <div className="slide-text">
                    <h2 className="slide-title">{slide.title}</h2>
                    <p className="slide-subtitle">{slide.subtitle}</p>
                    
                    <button className="cta-button">{slide.buttonText}</button>
                  </div>
                  
                  <div className="slide-image">
                    <img src={slide.image} alt={slide.title} />
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