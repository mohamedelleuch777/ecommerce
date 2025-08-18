import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './AddToCartButton.module.css';

const AddToCartButton = ({ 
  product, 
  size = 'medium', 
  variant = 'primary',
  showQuantityControls = false,
  className = '',
  onSuccess,
  onError
}) => {
  const { addToCart, isInCart, getCartItemQuantity, updateQuantity } = useCart();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const productId = product._id || product.id;
  const inCart = isInCart(productId);
  const cartQuantity = getCartItemQuantity(productId);

  const handleAddToCart = async () => {
    if (!product.inStock && product.inStock !== undefined) {
      return; // Don't add out of stock items
    }

    setIsLoading(true);
    try {
      await addToCart(product, quantity);
      setJustAdded(true);
      
      // Reset the "just added" state after 2 seconds
      setTimeout(() => setJustAdded(false), 2000);
      
      if (onSuccess) {
        onSuccess(product, quantity);
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsLoading(true);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Check if product is out of stock
  const isOutOfStock = product.inStock === false;

  // Button class names
  const buttonClasses = [
    styles.addToCartButton,
    styles[size],
    styles[variant],
    className,
    isOutOfStock && styles.outOfStock,
    justAdded && styles.justAdded,
    inCart && styles.inCart
  ].filter(Boolean).join(' ');

  if (inCart && showQuantityControls) {
    return (
      <div className={styles.quantityControlsContainer}>
        <div className={styles.quantityControls}>
          <button
            className={styles.quantityButton}
            onClick={() => handleUpdateQuantity(cartQuantity - 1)}
            disabled={cartQuantity <= 1 || isLoading}
            aria-label={t('decreaseQuantity') || 'Decrease quantity'}
          >
            <Minus size={16} />
          </button>
          
          <span className={styles.quantityDisplay}>
            {isLoading ? <Loader2 size={16} className={styles.spinner} /> : cartQuantity}
          </span>
          
          <button
            className={styles.quantityButton}
            onClick={() => handleUpdateQuantity(cartQuantity + 1)}
            disabled={isLoading}
            aria-label={t('increaseQuantity') || 'Increase quantity'}
          >
            <Plus size={16} />
          </button>
        </div>
        <span className={styles.inCartLabel}>
          {t('inCart') || 'In Cart'}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.addToCartContainer}>
      {showQuantityControls && !inCart && (
        <div className={styles.quantitySelector}>
          <button
            className={styles.quantityButton}
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            aria-label={t('decreaseQuantity') || 'Decrease quantity'}
          >
            <Minus size={16} />
          </button>
          
          <span className={styles.quantityDisplay}>
            {quantity}
          </span>
          
          <button
            className={styles.quantityButton}
            onClick={incrementQuantity}
            aria-label={t('increaseQuantity') || 'Increase quantity'}
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      <button
        className={buttonClasses}
        onClick={handleAddToCart}
        disabled={isLoading || isOutOfStock}
        aria-label={
          isOutOfStock 
            ? (t('outOfStock') || 'Out of stock')
            : justAdded 
              ? (t('addedToCart') || 'Added to cart!')
              : (t('addToCart') || 'Add to cart')
        }
      >
        {isLoading ? (
          <>
            <Loader2 size={size === 'small' ? 16 : size === 'large' ? 24 : 20} className={styles.spinner} />
            <span>{t('adding') || 'Adding...'}</span>
          </>
        ) : justAdded ? (
          <>
            <Check size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
            <span>{t('addedToCart') || 'Added!'}</span>
          </>
        ) : isOutOfStock ? (
          <span>{t('outOfStock') || 'Out of Stock'}</span>
        ) : (
          <>
            <ShoppingCart size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
            <span>{t('addToCart') || 'Add to Cart'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AddToCartButton;