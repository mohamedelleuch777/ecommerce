import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  detailedDescription: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  discount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  category: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  specifications: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Create indexes for better query performance

// Text search indexes with weights for relevance scoring
productSchema.index({ 
  name: 'text', 
  description: 'text',
  category: 'text'
}, {
  weights: {
    name: 10,        // Name is most important
    category: 5,     // Category is moderately important  
    description: 1   // Description is least important
  },
  name: 'search_text'
});

// Single field indexes for filtering
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ inStock: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ reviews: -1 });
productSchema.index({ createdAt: -1 });

// Compound indexes for common filter combinations
productSchema.index({ category: 1, inStock: 1 });
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ inStock: 1, featured: 1 });
productSchema.index({ rating: -1, reviews: -1 });

// Index for price range queries
productSchema.index({ price: 1, inStock: 1 });

// Index for recommendation queries
productSchema.index({ category: 1, rating: -1, reviews: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;