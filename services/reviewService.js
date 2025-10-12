const Review = require('../models/Review');
const mongoose = require('mongoose');

// Create a new review
const createReview = async (reviewData) => {
  try {
    const review = new Review(reviewData);
    const savedReview = await review.save();
    return savedReview;
  } catch (error) {
    throw error;
  }
};

// Get all reviews
const getAllReviews = async () => {
  try {
    const reviews = await Review.find({})
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address');
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get review by ID
const getReviewById = async (id) => {
  try {
    const review = await Review.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address');
    return review;
  } catch (error) {
    throw error;
  }
};

// Get reviews by user ID
const getReviewsByUserId = async (userId) => {
  try {
    const reviews = await Review.find({ userId })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get reviews by station ID
const getReviewsByStationId = async (stationId) => {
  try {
    const reviews = await Review.find({ stationId })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get reviews by rating
const getReviewsByRating = async (rating) => {
  try {
    const reviews = await Review.find({ rating })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get reviews by comment type
const getReviewsByCommentType = async (commentType) => {
  try {
    const reviews = await Review.find({ commentType })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get verified reviews
const getVerifiedReviews = async () => {
  try {
    const reviews = await Review.find({ isVerified: true })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get reviews by date range
const getReviewsByDateRange = async (startDate, endDate) => {
  try {
    const reviews = await Review.find({
      visitDate: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ visitDate: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get recent reviews
const getRecentReviews = async (limit = 10) => {
  try {
    const reviews = await Review.find({})
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 })
      .limit(limit);
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Search reviews by comment text
const searchReviews = async (searchTerm) => {
  try {
    const reviews = await Review.find({
      comment: { $regex: searchTerm, $options: 'i' }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Get reviews with images
const getReviewsWithImages = async () => {
  try {
    const reviews = await Review.find({
      images: { $exists: true, $not: { $size: 0 } }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .sort({ createdAt: -1 });
    return reviews;
  } catch (error) {
    throw error;
  }
};

// Update review by ID
const updateReview = async (id, updateData) => {
  try {
    const review = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address');
    return review;
  } catch (error) {
    throw error;
  }
};

// Verify review
const verifyReview = async (id) => {
  try {
    const review = await Review.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address');
    return review;
  } catch (error) {
    throw error;
  }
};

// Unverify review
const unverifyReview = async (id) => {
  try {
    const review = await Review.findByIdAndUpdate(
      id,
      { isVerified: false },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address');
    return review;
  } catch (error) {
    throw error;
  }
};

// Delete review by ID
const deleteReview = async (id) => {
  try {
    const review = await Review.findByIdAndDelete(id);
    return review;
  } catch (error) {
    throw error;
  }
};

// Get review statistics for a station
const getStationReviewStats = async (stationId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { stationId: mongoose.Types.ObjectId(stationId) } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          verifiedReviews: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          positiveReviews: {
            $sum: { $cond: [{ $eq: ['$commentType', 'positive'] }, 1, 0] }
          },
          negativeReviews: {
            $sum: { $cond: [{ $eq: ['$commentType', 'negative'] }, 1, 0] }
          },
          neutralReviews: {
            $sum: { $cond: [{ $eq: ['$commentType', 'neutral'] }, 1, 0] }
          },
          reviewsWithImages: {
            $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      verifiedReviews: 0,
      positiveReviews: 0,
      negativeReviews: 0,
      neutralReviews: 0,
      reviewsWithImages: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get review statistics for a user
const getUserReviewStats = async (userId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          verifiedReviews: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          positiveReviews: {
            $sum: { $cond: [{ $eq: ['$commentType', 'positive'] }, 1, 0] }
          },
          negativeReviews: {
            $sum: { $cond: [{ $eq: ['$commentType', 'negative'] }, 1, 0] }
          },
          neutralReviews: {
            $sum: { $cond: [{ $eq: ['$commentType', 'neutral'] }, 1, 0] }
          },
          reviewsWithImages: {
            $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalReviews: 0,
      averageRating: 0,
      verifiedReviews: 0,
      positiveReviews: 0,
      negativeReviews: 0,
      neutralReviews: 0,
      reviewsWithImages: 0
    };
  } catch (error) {
    throw error;
  }
};

// Check if user has reviewed a station
const hasUserReviewedStation = async (userId, stationId) => {
  try {
    const review = await Review.findOne({ userId, stationId });
    return !!review;
  } catch (error) {
    throw error;
  }
};

// Get user's review for a specific station
const getUserStationReview = async (userId, stationId) => {
  try {
    const review = await Review.findOne({ userId, stationId })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address');
    return review;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByUserId,
  getReviewsByStationId,
  getReviewsByRating,
  getReviewsByCommentType,
  getVerifiedReviews,
  getReviewsByDateRange,
  getRecentReviews,
  searchReviews,
  getReviewsWithImages,
  updateReview,
  verifyReview,
  unverifyReview,
  deleteReview,
  getStationReviewStats,
  getUserReviewStats,
  hasUserReviewedStation,
  getUserStationReview
};
