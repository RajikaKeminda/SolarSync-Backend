const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{
    type: String,
    trim: true
  }],
  visitDate: {
    type: Date,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  commentType: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral'
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add virtual for id field to match the TypeScript interface
reviewSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
reviewSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
reviewSchema.index({ userId: 1 });
reviewSchema.index({ stationId: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ visitDate: 1 });
reviewSchema.index({ isVerified: 1 });
reviewSchema.index({ commentType: 1 });

// Compound index to prevent duplicate reviews from same user for same station
reviewSchema.index({ userId: 1, stationId: 1 }, { unique: true });

// Note: commentType is now determined by AI sentiment analysis during review creation
// See aiReviewSentimentService.js for implementation

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
