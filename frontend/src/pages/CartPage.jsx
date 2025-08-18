import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ArrowRight, Trash2, Gift, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { usePageTitle } from '../hooks/usePageTitle';
import CartItem from '../components/Cart/CartItem';
import styles from './CartPage.module.css';

const CartPage = () => {
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
  const [isClearing, setIsClearing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  usePageTitle(t('cartPageTitle') || 'Shopping Cart');

  const handleClearCart = async () => {
    if (window.confirm(t('confirmClearCart') || 'Are you sure you want to clear your cart?')) {
      setIsClearing(true);
      try {
        await clearCart();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      // TODO: Implement promo code logic
      console.log('Applying promo code:', promoCode);
      setPromoApplied(true);
    }
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  if (cart.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.container}>
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>
              <ShoppingBag size={80} />
            </div>
            <h1>{t('cartEmpty') || 'Your cart is empty'}</h1>
            <p>{t('cartEmptyDescription') || 'Looks like you haven\'t added anything to your cart yet. Discover our amazing products!'}</p>
            <Link to="/" className={styles.continueShoppingButton}>
              <ArrowLeft size={20} />
              {t('continueShopping') || 'Continue Shopping'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1>
              <ShoppingBag size={32} />
              {t('shoppingCart') || 'Shopping Cart'}
              <span className={styles.itemCount}>({cartCount} {cartCount === 1 ? t('item') : t('items') || 'items'})</span>
            </h1>
            <Link to="/" className={styles.continueShoppingLink}>
              <ArrowLeft size={20} />
              {t('continueShopping') || 'Continue Shopping'}
            </Link>
          </div>
          
          {cart.length > 0 && (
            <button
              className={styles.clearCartButton}
              onClick={handleClearCart}
              disabled={isClearing}
            >
              <Trash2 size={16} />
              {isClearing ? (t('clearing') || 'Clearing...') : (t('clearCart') || 'Clear Cart')}
            </button>
          )}
        </div>

        <div className={styles.cartContent}>
          {/* Cart Items */}
          <div className={styles.cartItems}>
            <div className={styles.itemsHeader}>
              <h2>{t('items') || 'Items'}</h2>
              <span>{cartCount} {cartCount === 1 ? t('item') : t('items') || 'items'}</span>
            </div>
            
            <div className={styles.itemsList}>
              {cart.map((item) => (
                <CartItem
                  key={item.product._id || item.product.id}
                  item={item}
                  layout="vertical"
                  showRemoveButton={true}
                />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryCard}>
              <h2>{t('orderSummary') || 'Order Summary'}</h2>
              
              {/* Promo Code */}
              <div className={styles.promoSection}>
                <div className={styles.promoInput}>
                  <input
                    type="text"
                    placeholder={t('promoCodePlaceholder') || 'Enter promo code'}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className={styles.promoCodeInput}
                  />
                  <button
                    className={styles.applyPromoButton}
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim()}
                  >
                    {t('apply') || 'Apply'}
                  </button>
                </div>
                {promoApplied && (
                  <div className={styles.promoApplied}>
                    <Gift size={16} />
                    <span>{t('promoApplied') || 'Promo code applied!'}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>{t('subtotal') || 'Subtotal'}:</span>
                  <span>{formatPrice(cartSubtotal)}</span>
                </div>
                
                <div className={styles.priceRow}>
                  <span>{t('tax') || 'Tax'}:</span>
                  <span>{formatPrice(cartTax)}</span>
                </div>
                
                <div className={styles.priceRow}>
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
                
                {promoApplied && (
                  <div className={`${styles.priceRow} ${styles.discount}`}>
                    <span>{t('discount') || 'Discount'}:</span>
                    <span>-$5.00</span>
                  </div>
                )}
                
                <div className={`${styles.priceRow} ${styles.total}`}>
                  <span>{t('total') || 'Total'}:</span>
                  <span>{formatPrice(cartGrandTotal - (promoApplied ? 5 : 0))}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link to="/checkout" className={styles.checkoutButton}>
                {t('proceedToCheckout') || 'Proceed to Checkout'}
                <ArrowRight size={20} />
              </Link>

              {/* Security Features */}
              <div className={styles.securityFeatures}>
                <div className={styles.feature}>
                  <Shield size={16} />
                  <span>{t('secureCheckout') || 'Secure Checkout'}</span>
                </div>
                <div className={styles.feature}>
                  <Truck size={16} />
                  <span>{t('freeShippingOver50') || 'Free shipping over $50'}</span>
                </div>
                <div className={styles.feature}>
                  <RotateCcw size={16} />
                  <span>{t('easyReturns') || 'Easy returns'}</span>
                </div>
              </div>

              {/* Free Shipping Notice */}
              {cartShipping > 0 && (
                <div className={styles.shippingNotice}>
                  <Truck size={16} />
                  <span>
                    {t('freeShippingNotice') || `Add ${formatPrice(50 - cartSubtotal)} more for free shipping!`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Products */}
        <div className={styles.recommendations}>
          <h2>{t('youMightAlsoLike') || 'You might also like'}</h2>
          <div className={styles.recommendedProducts}>
            {/* TODO: Add recommended products component */}
            <div className={styles.comingSoon}>
              <p>{t('recommendationsComingSoon') || 'Product recommendations coming soon...'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;