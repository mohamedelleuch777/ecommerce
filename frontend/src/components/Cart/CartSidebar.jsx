import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import CartItem from './CartItem';
import styles from './CartSidebar.module.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const { 
    cart, 
    cartCount, 
    cartSubtotal, 
    cartTax, 
    cartShipping, 
    cartGrandTotal, 
    clearCart 
  } = useCart();
  const { t } = useLanguage();

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleClearCart = async () => {
    if (window.confirm(t('confirmClearCart') || 'Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.show : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div 
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="cart-title" className={styles.title}>
            <ShoppingBag size={24} />
            {t('shoppingCart') || 'Shopping Cart'}
            {cartCount > 0 && (
              <span className={styles.itemCount}>({cartCount})</span>
            )}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label={t('closeCart') || 'Close cart'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {cart.length === 0 ? (
            /* Empty Cart */
            <div className={styles.emptyCart}>
              <div className={styles.emptyIcon}>
                <ShoppingBag size={64} />
              </div>
              <h3>{t('cartEmpty') || 'Your cart is empty'}</h3>
              <p>{t('cartEmptyDescription') || 'Add some items to get started!'}</p>
              <Link to="/" className={styles.continueShopping} onClick={onClose}>
                {t('continueShopping') || 'Continue Shopping'}
              </Link>
            </div>
          ) : (
            /* Cart Items */
            <>
              <div className={styles.cartItems}>
                {cart.map((item) => (
                  <CartItem
                    key={item.product._id || item.product.id}
                    item={item}
                    layout="horizontal"
                    showRemoveButton={true}
                  />
                ))}
              </div>

              {/* Clear Cart Button */}
              {cart.length > 0 && (
                <div className={styles.clearCartContainer}>
                  <button
                    className={styles.clearCartButton}
                    onClick={handleClearCart}
                  >
                    <Trash2 size={16} />
                    {t('clearCart') || 'Clear Cart'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className={styles.footer}>
            {/* Order Summary */}
            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>{t('subtotal') || 'Subtotal'}:</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t('tax') || 'Tax'}:</span>
                <span>{formatPrice(cartTax)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>{t('shipping') || 'Shipping'}:</span>
                <span>
                  {cartShipping === 0 ? (
                    <span className={styles.freeShipping}>
                      {t('free') || 'Free'}
                    </span>
                  ) : (
                    formatPrice(cartShipping)
                  )}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>{t('total') || 'Total'}:</span>
                <span>{formatPrice(cartGrandTotal)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Link 
                to="/cart" 
                className={styles.viewCartButton}
                onClick={onClose}
              >
                {t('viewCart') || 'View Cart'}
              </Link>
              <button 
                className={styles.checkoutButton}
                onClick={() => {
                  // TODO: Implement checkout functionality
                  console.log('Proceeding to checkout...');
                }}
              >
                {t('checkout') || 'Checkout'}
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Free Shipping Notice */}
            {cartShipping > 0 && (
              <div className={styles.shippingNotice}>
                {t('freeShippingNotice') || `Add ${formatPrice(50 - cartSubtotal)} more for free shipping!`}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;