import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  logoUrl: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
brandSchema.index({ isActive: 1, displayOrder: 1 });

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;