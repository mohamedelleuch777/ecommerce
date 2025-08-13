import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Truck, RotateCcw, Shield } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { getTranslation } from '../../utils/translations';
import { getStandardizedCategorySlug } from '../../utils/slugs';
import ApiService from '../../services/api';
import './Footer.css';
import logo from '../../assets/logo-text.png';

const Footer = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const brandsScrollRef = useRef(null);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch the 6 most active categories directly from the API
        const data = await ApiService.getActiveCategories(language, 6);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        // Fallback to static categories if API fails
        setCategories([
          { id: 'fallback1', name: getTranslation('electronics', language), productCount: 156 },
          { id: 'fallback2', name: getTranslation('fashion', language), productCount: 89 },
          { id: 'fallback3', name: getTranslation('homeGarden', language), productCount: 67 },
          { id: 'fallback4', name: getTranslation('sportsOutdoors', language), productCount: 45 },
          { id: 'fallback5', name: getTranslation('healthBeauty', language), productCount: 78 },
          { id: 'fallback6', name: getTranslation('booksMedia', language), productCount: 23 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [language]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const data = await ApiService.getBrands();
        setBrands(data || []);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setBrands([]);
      } finally {
        setBrandsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Add manual scroll functionality for brands carousel
  useEffect(() => {
    const brandsContainer = brandsScrollRef.current;
    if (!brandsContainer) return;

    const handleWheel = (e) => {
      e.preventDefault();
      brandsContainer.scrollLeft += e.deltaY;
    };

    brandsContainer.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      brandsContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-brands">
        <div className="container">
          <div className="brands-header">
            <h3>{getTranslation('popularBrands', language)}</h3>
          </div>
          <div className="brands-carousel" ref={brandsScrollRef}>
            <div className="brands-scroll">
              {brandsLoading ? (
                // Loading placeholder
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={`loading-${index}`} className="brand-logo loading">
                    <div className="loading-shimmer"></div>
                  </div>
                ))
              ) : (
                <>
                  {/* First set of brands */}
                  {brands.map((brand) => (
                    <div key={brand._id} className="brand-logo">
                      <img src={brand.logoUrl} alt={brand.name} title={brand.description} />
                    </div>
                  ))}
                  {/* Duplicate for seamless loop */}
                  {brands.map((brand) => (
                    <div key={`${brand._id}-duplicate`} className="brand-logo">
                      <img src={brand.logoUrl} alt={brand.name} title={brand.description} />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <Truck size={40} />
              <div>
                <h4>{getTranslation('freeShippingTitle', language)}</h4>
                <p>{getTranslation('freeShippingDesc', language)}</p>
              </div>
            </div>
            <div className="feature-item">
              <RotateCcw size={40} />
              <div>
                <h4>{getTranslation('easyReturnTitle', language)}</h4>
                <p>{getTranslation('easyReturnDesc', language)}</p>
              </div>
            </div>
            <div className="feature-item">
              <Shield size={40} />
              <div>
                <h4>{getTranslation('secureShoppingTitle', language)}</h4>
                <p>{getTranslation('secureShoppingDesc', language)}</p>
              </div>
            </div>
            <div className="feature-item">
              <CreditCard size={40} />
              <div>
                <h4>{getTranslation('securePaymentTitle', language)}</h4>
                <p>{getTranslation('securePaymentDesc', language)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <Link to="/">
                  <img src={logo} alt="Logo" />
                </Link>
                {/* <h2>{getTranslation('brandName', language)}</h2> */}
                <p>{getTranslation('companyDescription', language)}</p>
              </div>
              
              <div className="footer-contact">
                <div className="contact-item">
                  <Phone size={20} />
                  <span>{getTranslation('phone', language)}</span>
                </div>
                <div className="contact-item">
                  <Mail size={20} />
                  <span>{getTranslation('email', language)}</span>
                </div>
                <div className="contact-item">
                  <MapPin size={20} />
                  <span>{getTranslation('address', language)}</span>
                </div>
              </div>
            </div>

            <div className="footer-section">
              <h3>{getTranslation('categories', language)}</h3>
              <ul>
                {loading ? (
                  <li><span>{getTranslation('loading', language)}...</span></li>
                ) : (
                  categories.map((category) => {
                    const categorySlug = getStandardizedCategorySlug(category.name);
                    return (
                      <li key={category.id}>
                        <Link to={`/category/${categorySlug}`}>
                          {category.name} ({category.productCount})
                        </Link>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            <div className="footer-section">
              <h3>{getTranslation('corporate', language)}</h3>
              <ul>
                <li><a href="#hakkimizda">{getTranslation('aboutUs', language)}</a></li>
                <li><a href="#magazalar">{getTranslation('ourStores', language)}</a></li>
                <li><a href="#kariyer">{getTranslation('career', language)}</a></li>
                <li><a href="#basinda-biz">{getTranslation('pressCenter', language)}</a></li>
                <li><a href="#yatirimci">{getTranslation('investorRelations', language)}</a></li>
                <li><a href="#surdurulebilirlik">{getTranslation('sustainability', language)}</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>{getTranslation('help', language)}</h3>
              <ul>
                <li><a href="#siparis-takip">{getTranslation('orderTracking', language)}</a></li>
                <li><a href="#iade">{getTranslation('returnExchange', language)}</a></li>
                <li><a href="#garanti">{getTranslation('warrantyTerms', language)}</a></li>
                <li><a href="#kargo">{getTranslation('shippingInfo', language)}</a></li>
                <li><a href="#sss">{getTranslation('faq', language)}</a></li>
                <li><a href="#iletisim">{getTranslation('contact', language)}</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>{getTranslation('membership', language)}</h3>
              <ul>
                <li><a href="#hesabim">{getTranslation('myAccount', language)}</a></li>
                <li><a href="#siparislerim">{getTranslation('myOrders', language)}</a></li>
                <li><a href="#favoriler">{getTranslation('favorites', language)}</a></li>
                <li><a href="#adres-defteri">{getTranslation('addressBook', language)}</a></li>
                <li><a href="#hediye-ceki">{getTranslation('giftCard', language)}</a></li>
                <li><a href="#puan-durumu">{getTranslation('pointsStatus', language)}</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>{getTranslation('followUsTitle', language)}</h3>
              <div className="social-links">
                <a href="#facebook" className="social-link">
                  <Facebook size={24} />
                </a>
                <a href="#twitter" className="social-link">
                  <Twitter size={24} />
                </a>
                <a href="#instagram" className="social-link">
                  <Instagram size={24} />
                </a>
                <a href="#youtube" className="social-link">
                  <Youtube size={24} />
                </a>
              </div>
              
              <div className="newsletter">
                <h4>{getTranslation('newsletterTitle', language)}</h4>
                <p>{getTranslation('newsletterDesc', language)}</p>
                <div className="newsletter-form">
                  <input type="email" placeholder={getTranslation('emailPlaceholder', language)} />
                  <button type="submit">{getTranslation('subscribe', language)}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>&copy; {new Date().getFullYear()}
              <a target='_blank' href="https://www.xilyor.com"> Xilyor</a>.&nbsp;
              {getTranslation('allRightsReserved', language)}</p>
            </div>
            
            <div className="footer-links">
              <a href="#gizlilik">{getTranslation('privacyPolicy', language)}</a>
              <a href="#kullanim">{getTranslation('termsOfService', language)}</a>
              <a href="#cerez">{getTranslation('cookiePolicy', language)}</a>
              <a href="#kvkk">{getTranslation('gdpr', language)}</a>
            </div>
            
            <div className="payment-methods">
              <span>{getTranslation('paymentMethods', language)}</span>
              <div className="payment-icons">
                <span>💳</span>
                <span>🏦</span>
                <span>💸</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;