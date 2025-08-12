import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, CreditCard, Truck, RotateCcw, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTranslation } from '../../utils/translations';
import './Footer.css';

const Footer = () => {
  const { language } = useLanguage();

  return (
    <footer className="footer">
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
                <h2>{getTranslation('brandName', language)}</h2>
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
                <li><a href="#telefon">{getTranslation('phoneTablet', language)}</a></li>
                <li><a href="#bilgisayar">{getTranslation('computerLaptop', language)}</a></li>
                <li><a href="#tv">{getTranslation('tvAudioSystems', language)}</a></li>
                <li><a href="#beyaz-esya">{getTranslation('whiteGoods', language)}</a></li>
                <li><a href="#gaming">{getTranslation('gaming', language)}</a></li>
                <li><a href="#spor">{getTranslation('sportsOutdoor', language)}</a></li>
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
              <p>&copy; 2024 {getTranslation('brandName', language)}. {getTranslation('allRightsReserved', language)}</p>
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