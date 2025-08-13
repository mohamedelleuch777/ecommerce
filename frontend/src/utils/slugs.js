/**
 * Utility functions for generating consistent URL slugs across the application
 */

/**
 * Generate a category slug from category name
 * This function should be used consistently across all components
 * to ensure navigation works properly between header, footer, and category cards
 */
export const getCategorySlug = (categoryName) => {
  return categoryName
    .toLowerCase()
    .replace(/[\s&]+/g, '-')        // Replace spaces and & with hyphens
    .replace(/[éèê]/g, 'e')         // Replace French e accents
    .replace(/[àâ]/g, 'a')          // Replace French a accents  
    .replace(/[ùû]/g, 'u')          // Replace French u accents
    .replace(/[îï]/g, 'i')          // Replace French i accents
    .replace(/[ôö]/g, 'o')          // Replace French o accents
    .replace(/[ç]/g, 'c')           // Replace French c cedilla
    .replace(/[^a-z0-9-]/g, '')    // Remove any other special characters
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
};

/**
 * Map of category names to their standardized slugs
 * This ensures consistency across different language versions
 */
export const CATEGORY_SLUG_MAP = {
  // English
  'Electronics': 'electronics',
  'Fashion': 'fashion', 
  'Home & Garden': 'home-garden',
  'Sports & Outdoors': 'sports-outdoors',
  'Health & Beauty': 'health-beauty',
  'Books & Media': 'books-media',
  
  // French
  'Électronique': 'electronics',
  'Mode': 'fashion',
  'Maison et Jardin': 'home-garden', 
  'Sports et Plein Air': 'sports-outdoors',
  'Santé et Beauté': 'health-beauty',
  'Livres et Médias': 'books-media'
};

/**
 * Get the standardized slug for a category name
 * Uses the map first, falls back to slug generation
 */
export const getStandardizedCategorySlug = (categoryName) => {
  // First try to get from the standardized map
  if (CATEGORY_SLUG_MAP[categoryName]) {
    return CATEGORY_SLUG_MAP[categoryName];
  }
  
  // Fall back to generated slug
  return getCategorySlug(categoryName);
};