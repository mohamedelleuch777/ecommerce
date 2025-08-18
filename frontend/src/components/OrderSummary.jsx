import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import styles from './OrderSummary.module.css';

const OrderSummary = ({ cart, subtotal, tax, shipping, total, showEdit = true }) => {
  const { t } = useLanguage();

  const formatPrice = (price) => {
    if (typeof price === 'string') {
      return price;
    }
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image || '/placeholder-product.jpg';
  };

  return (
    <div className={styles.orderSummary}>
      <h3>{t('orderSummary')}</h3>
      
      {/* Cart items */}
      <div className={styles.cartItems}>
        {cart && cart.length > 0 ? cart.map((item) => {
          const product = item.product || item;
          const itemPrice = item.price || product.price;
          const itemQuantity = item.quantity || 1;
          
          return (
            <div key={item._id || item.id || product._id} className={styles.cartItem}>
              <div className={styles.itemImage}>
                <img 
                  src={getProductImage(product)} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
                <span className={styles.quantity}>{itemQuantity}</span>
              </div>
              
              <div className={styles.itemDetails}>
                <h4>{product.name}</h4>
                {item.variants && Object.keys(item.variants).length > 0 && (
                  <div className={styles.variants}>
                    {Object.entries(item.variants).map(([key, value]) => (
                      value && (
                        <span key={key} className={styles.variant}>
                          {key}: {value}
                        </span>
                      )
                    ))}
                  </div>
                )}
                <div className={styles.itemPrice}>
                  {formatPrice(itemPrice)} × {itemQuantity}
                </div>
              </div>
              
              <div className={styles.itemTotal}>
                {formatPrice(typeof itemPrice === 'string' 
                  ? parseFloat(itemPrice.replace('$', '')) * itemQuantity
                  : itemPrice * itemQuantity
                )}
              </div>
            </div>
          );
        }) : (
          <div className={styles.emptyCart}>
            <p>{t('cartEmpty')}</p>
          </div>
        )}
      </div>

      {showEdit && cart && cart.length > 0 && (
        <div className={styles.editCart}>
          <Link to="/cart" className={styles.editLink}>
            {t('editCart')}
          </Link>
        </div>
      )}

      {/* Price breakdown */}
      <div className={styles.priceBreakdown}>
        <div className={styles.priceRow}>
          <span>{t('subtotal')}</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        <div className={styles.priceRow}>
          <span>{t('shipping')}</span>
          <span>
            {shipping === 0 ? (
              <span className={styles.freeShipping}>{t('free')}</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
        
        <div className={styles.priceRow}>
          <span>{t('tax')}</span>
          <span>{formatPrice(tax)}</span>
        </div>
        
        <div className={styles.divider}></div>
        
        <div className={styles.totalRow}>
          <span>{t('total')}</span>
          <span className={styles.totalAmount}>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Shipping info */}
      <div className={styles.shippingInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>🚚</span>
          <div>
            <div className={styles.infoTitle}>{t('freeShipping')}</div>
            <div className={styles.infoSubtitle}>{t('ordersOver50')}</div>
          </div>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>📦</span>
          <div>
            <div className={styles.infoTitle}>{t('fastDelivery')}</div>
            <div className={styles.infoSubtitle}>{t('businessDays')}</div>
          </div>
        </div>
        
        <div className={styles.infoItem}>
          <span className={styles.infoIcon}>🔄</span>
          <div>
            <div className={styles.infoTitle}>{t('easyReturns')}</div>
            <div className={styles.infoSubtitle}>{t('dayReturnPolicy')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;