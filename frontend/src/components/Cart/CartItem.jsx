import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, Loader2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './CartItem.module.css';

const CartItem = ({ item, showRemoveButton = true, layout = 'horizontal' }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const product = item.product;
  const productId = product._id || product.id;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      setIsRemoving(false);
      // You might want to show a toast notification here
    }
  };

  const calculateItemTotal = () => {
    const price = Number(product.price) || 0;
    return (price * item.quantity).toFixed(2);
  };

  const formatPrice = (price) => {
    return typeof price === 'string' ? price : `$${price.toFixed(2)}`;
  };

  const isVertical = layout === 'vertical';

  return (
    <div className={`${styles.cartItem} ${isVertical ? styles.vertical : styles.horizontal}`}>
      {isRemoving && <div className={styles.removingOverlay} />}
      
      <div className={styles.productImage}>
        <Link to={`/product/${productId}`}>
          <img 
            src={product.image} 
            alt={product.name}
            loading="lazy"
          />
        </Link>
        {product.discount && (
          <span className={styles.discountBadge}>
            -{product.discount}%
          </span>
        )}
      </div>

      <div className={styles.productInfo}>
        <div className={styles.productDetails}>
          <Link to={`/product/${productId}`} className={styles.productName}>
            {product.name}
          </Link>
          
          <div className={styles.productMeta}>
            {product.category && (
              <span className={styles.category}>{product.category}</span>
            )}
            {product.inStock !== undefined && (
              <span className={`${styles.stockStatus} ${product.inStock ? styles.inStock : styles.outOfStock}`}>
                {product.inStock ? t('inStock') : t('outOfStock')}
              </span>
            )}
          </div>

          <div className={styles.priceSection}>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}>
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice !== product.price && (
                <span className={styles.originalPrice}>
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {!isVertical && (
              <div className={styles.itemTotal}>
                <span className={styles.itemTotalLabel}>{t('total')}:</span>
                <span className={styles.itemTotalPrice}>${calculateItemTotal()}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.quantityControls}>
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
              aria-label={t('decreaseQuantity') || 'Decrease quantity'}
            >
              <Minus size={16} />
            </button>
            
            <div className={styles.quantityDisplay}>
              {isUpdating ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <span>{item.quantity}</span>
              )}
            </div>
            
            <button
              className={styles.quantityButton}
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              aria-label={t('increaseQuantity') || 'Increase quantity'}
            >
              <Plus size={16} />
            </button>
          </div>

          {isVertical && (
            <div className={styles.itemTotal}>
              <span className={styles.itemTotalLabel}>{t('total')}:</span>
              <span className={styles.itemTotalPrice}>${calculateItemTotal()}</span>
            </div>
          )}

          {showRemoveButton && (
            <button
              className={styles.removeButton}
              onClick={handleRemove}
              disabled={isRemoving}
              aria-label={t('removeFromCart') || 'Remove from cart'}
              title={t('removeFromCart') || 'Remove from cart'}
            >
              {isRemoving ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <X size={16} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;