import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import styles from './FavoriteButton.module.css';

const FavoriteButton = ({ product, className = '', size = 18, showTooltip = true }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  const productId = product._id || product.id;
  const favorite = isFavorite(productId);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    await toggleFavorite(product);
    
    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return (
    <button
      className={`${styles.favoriteButton} ${favorite ? styles.active : ''} ${isAnimating ? styles.animating : ''} ${className}`}
      onClick={handleToggleFavorite}
      title={showTooltip ? (favorite ? 'Remove from favorites' : 'Add to favorites') : undefined}
      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={size}
        width={size}
        height={size}
        strokeWidth={1.5}
        fill={favorite ? 'currentColor' : 'none'}
        className={styles.heartIcon}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          display: 'block' 
        }}
      />
    </button>
  );
};

export default FavoriteButton;