import mongoose from 'mongoose';

const searchAnalyticsSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  userIP: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  results: {
    type: Number,
    default: 0
  },
  clicked: {
    type: Boolean,
    default: false
  },
  clickedItem: {
    type: {
      type: String, // 'product' or 'category'
      enum: ['product', 'category']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  filters: {
    category: String,
    priceRange: String,
    minRating: Number,
    inStock: Boolean
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
searchAnalyticsSchema.index({ query: 1, createdAt: -1 });
searchAnalyticsSchema.index({ userIP: 1, createdAt: -1 });
searchAnalyticsSchema.index({ createdAt: -1 });

const SearchAnalytics = mongoose.model('SearchAnalytics', searchAnalyticsSchema);

export default SearchAnalytics;