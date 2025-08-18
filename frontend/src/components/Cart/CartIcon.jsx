import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './CartIcon.module.css';

const CartIcon = ({ onClick, className = '' }) => {
  const { cartCount } = useCart();
  const { t } = useLanguage();

  return (
    <div 
      className={`${styles.cartIcon} ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className={styles.iconContainer}>
        <ShoppingCart size={24} />
        {cartCount > 0 && (
          <span className={styles.cartBadge}>
            {cartCount > 99 ? '99+' : cartCount}
          </span>
        )}
      </div>
      <span className={styles.cartLabel}>
        {t('cart') || 'Cart'}
      </span>
    </div>
  );
};

export default CartIcon;