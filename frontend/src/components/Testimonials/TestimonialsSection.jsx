import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useLanguage } from '../../hooks/useLanguage';
import { getTranslation } from '../../utils/translations';
import ApiService from '../../services/api';
import styles from './TestimonialsSection.module.css';

const TestimonialsSection = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const data = await ApiService.getTestimonials();
        setTestimonials(data);
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
        // Fallback data if API fails
        setTestimonials([
          {
            id: 1,
            name: 'John Doe',
            title: 'Verified Customer',
            comment: 'Great shopping experience! Fast delivery and excellent customer service.',
            rating: 5,
            image: '/images/customer1.jpg',
            date: '2024-07-15'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className={styles.testimonialsSection}>
        <div className="container">
          <div className={styles.loadingPlaceholder}>
            <p>{getTranslation('loadingTestimonials', language)}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.testimonialsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{getTranslation('testimonials', language)}</h2>
          <p>{getTranslation('testimonialsSubtitle', language)}</p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className={styles.testimonialsSwiper}
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className={styles.testimonialCard}>
                <div className={styles.quoteIcon}>
                  <Quote size={32} />
                </div>
                
                <div className={styles.testimonialRating}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < testimonial.rating ? '#ffc107' : 'none'}
                      stroke={i < testimonial.rating ? '#ffc107' : '#ddd'}
                    />
                  ))}
                </div>

                <p className={styles.testimonialComment}>"{testimonial.comment}"</p>

                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>
                    <img src={testimonial.image} alt={testimonial.name} />
                  </div>
                  <div className={styles.authorInfo}>
                    <h4 className={styles.authorName}>{testimonial.name}</h4>
                    <p className={styles.authorTitle}>{testimonial.title}</p>
                    <p className={styles.testimonialDate}>{new Date(testimonial.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;