const mongoose = require('mongoose');

const portTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    required: true,
    min: 0
  },
  maxPower: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Number,
    required: true,
    min: 0
  }
});

const pricingSchema = new mongoose.Schema({
  baseRate: {
    type: Number,
    required: true,
    min: 0
  },
  peakRate: {
    type: Number,
    min: 0
  },
  offPeakRate: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    trim: true
  }
});

const operatingHoursSchema = new mongoose.Schema({
  monday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  },
  tuesday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  },
  wednesday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  },
  thursday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  },
  friday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  },
  saturday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  },
  sunday: {
    open: { type: String, trim: true },
    close: { type: String, trim: true },
    isOpen: { type: Boolean, default: true }
  }
});

const stationSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  totalPorts: {
    type: Number,
    required: true,
    min: 0
  },
  availablePorts: {
    type: Number,
    required: true,
    min: 0
  },
  portTypes: [portTypeSchema],
  pricing: {
    type: pricingSchema,
    required: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  operatingHours: {
    type: operatingHoursSchema,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  images: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add virtual for id field to match the TypeScript interface
stationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
stationSchema.set('toJSON', {
  virtuals: true
});

// Index for geospatial queries
stationSchema.index({ location: '2dsphere' });

// Index for owner queries
stationSchema.index({ ownerId: 1 });

// Index for active stations
stationSchema.index({ isActive: 1 });

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
