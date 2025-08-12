import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye, Truck, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import ApiService from '../services/api';
import './CategoryPage.css';

const CategoryPage = () => {
  const { category } = useParams();
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getProductsByCategory(category, language);
        setProducts(data.products);
        setCategoryName(data.categoryName || capitalizeCategory(category));
      } catch (err) {
        console.error('Failed to fetch category products:', err);
        setError(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [category, language]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const capitalizeCategory = (cat) => {
    return cat.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="loading-placeholder">
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="category-page">
        <div className="container">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{categoryName || capitalizeCategory(category)}</span>
          </nav>
          <div className="error-message">
            <h2>No products found</h2>
            <p>Sorry, no products are available in this category.</p>
            <Link to="/" className="back-home-btn">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{capitalizeCategory(category)}</span>
        </nav>

        {/* Category Header */}
        <div className="category-header">
          <h1>{categoryName || capitalizeCategory(category)}</h1>
          <p>{products.length} {products.length === 1 ? 'product' : 'products'} found</p>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-actions">
                <button className="action-btn favorite">
                  <Heart 
                    size={18} 
                    width={18} 
                    height={18} 
                    strokeWidth={1.5}
                    style={{ width: '18px', height: '18px', display: 'block' }}
                  />
                </button>
                <button className="action-btn view">
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
                <Link to={`/product/${product.id}`} className="product-name-link">
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;