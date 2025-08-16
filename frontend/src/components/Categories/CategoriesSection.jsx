import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './CategoriesSection.module.css';
import { useLanguage } from '../../hooks/useLanguage';
import { getTranslation } from '../../utils/translations';
import { getStandardizedCategorySlug } from '../../utils/slugs';
import ApiService from '../../services/api';

const CategoriesSection = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await ApiService.getCategories(language);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback data if API fails
        setCategories([
          {
            id: 1,
            name: 'Electronics',
            description: 'Latest gadgets and tech',
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80',
            productCount: 156,
            featured: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [language]);

  if (loading) {
    return (
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.loadingPlaceholder}>
            <p>{getTranslation('loadingCategories', language)}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.categoriesSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>{getTranslation('categories', language)}</h2>
          <p>{getTranslation('categoriesSubtitle', language)}</p>
        </div>

        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          navigation
          pagination={{ clickable: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 25
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 30
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 30
            },
            1200: {
              slidesPerView: 5,
              spaceBetween: 30
            }
          }}
          className={styles.categoriesSwiper}
        >
          {categories.map((category) => {
            const categorySlug = getStandardizedCategorySlug(category.name);
            return (
              <SwiperSlide key={category.id}>
                <Link to={`/category/${categorySlug}`} className={styles.categoryCardLink}>
                  <div className={styles.categoryCard}>
                    <div className={styles.categoryImage}>
                      <img src={category.image} alt={category.name} />
                    </div>
                    
                    <div className={styles.categoryContent}>
                      <h3 className={styles.categoryName}>{category.name}</h3>
                      <p className={styles.categoryDescription}>{category.description}</p>
                      <p className={styles.categoryCount}>{category.productCount} {getTranslation('productsCount', language)}</p>
                      
                      <div className={styles.categoryButton}>
                        <span>{getTranslation('viewAll', language)}</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className={styles.categoriesBanner}>
          <div className={styles.bannerContent}>
            <h3>{getTranslation('allCategories', language)}</h3>
            <p>{getTranslation('allCategoriesCount', language)}</p>
            <button className={styles.bannerButton}>{getTranslation('exploreCategories', language)}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;