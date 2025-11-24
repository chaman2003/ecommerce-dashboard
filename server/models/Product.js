import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sold: {
    type: Number,
    default: 0,
    min: 0
  },
  revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  brand: {
    type: String,
    default: 'Generic'
  },
  origin: {
    type: String,
    default: 'International'
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x400/1a1a2e/00d4ff?text=Product'
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  tags: {
    type: [String],
    default: []
  },
  featured: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ price: 1 });
productSchema.index({ sold: -1 });
productSchema.index({ revenue: -1 });
productSchema.index({ brand: 1 });
productSchema.index({ origin: 1 });
productSchema.index({ featured: 1 });

export default mongoose.model('Product', productSchema);
