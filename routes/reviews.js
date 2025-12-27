const express = require('express');
const router = express.Router();
const reviewService = require('../services/reviewService');

// GET /reviews - Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await reviewService.getAllReviews();
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
});

// GET /reviews/recent - Get recent reviews
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const reviews = await reviewService.getRecentReviews(limit);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent reviews',
      error: error.message
    });
  }
});

// GET /reviews/verified - Get verified reviews
router.get('/verified', async (req, res) => {
  try {
    const reviews = await reviewService.getVerifiedReviews();
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching verified reviews',
      error: error.message
    });
  }
});

// GET /reviews/with-images - Get reviews with images
router.get('/with-images', async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsWithImages();
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews with images',
      error: error.message
    });
  }
});

// GET /reviews/search - Search reviews by comment text
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required'
      });
    }
    
    const reviews = await reviewService.searchReviews(q);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching reviews',
      error: error.message
    });
  }
});

// GET /reviews/rating/:rating - Get reviews by rating
router.get('/rating/:rating', async (req, res) => {
  try {
    const { rating } = req.params;
    const ratingNum = parseInt(rating);
    
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5'
      });
    }
    
    const reviews = await reviewService.getReviewsByRating(ratingNum);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews by rating',
      error: error.message
    });
  }
});

// GET /reviews/type/:type - Get reviews by comment type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['positive', 'negative', 'neutral'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Comment type must be positive, negative, or neutral'
      });
    }
    
    const reviews = await reviewService.getReviewsByCommentType(type);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews by comment type',
      error: error.message
    });
  }
});

// GET /reviews/date-range - Get reviews by date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date parameters are required'
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before end date'
      });
    }
    
    const reviews = await reviewService.getReviewsByDateRange(start, end);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews by date range',
      error: error.message
    });
  }
});

// GET /reviews/user/:userId - Get reviews by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await reviewService.getReviewsByUserId(userId);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews by user',
      error: error.message
    });
  }
});

// GET /reviews/station/:stationId - Get reviews by station ID
router.get('/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const reviews = await reviewService.getReviewsByStationId(stationId);
    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews by station',
      error: error.message
    });
  }
});

// GET /reviews/user/:userId/station/:stationId - Get user's review for specific station
router.get('/user/:userId/station/:stationId', async (req, res) => {
  try {
    const { userId, stationId } = req.params;
    const review = await reviewService.getUserStationReview(userId, stationId);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user station review',
      error: error.message
    });
  }
});

// GET /reviews/user/:userId/has-reviewed/:stationId - Check if user has reviewed station
router.get('/user/:userId/has-reviewed/:stationId', async (req, res) => {
  try {
    const { userId, stationId } = req.params;
    const hasReviewed = await reviewService.hasUserReviewedStation(userId, stationId);
    
    res.json({
      success: true,
      data: { hasReviewed }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking review status',
      error: error.message
    });
  }
});

// GET /reviews/stats/station/:stationId - Get review statistics for a station
router.get('/stats/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const stats = await reviewService.getStationReviewStats(stationId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station review statistics',
      error: error.message
    });
  }
});

// GET /reviews/stats/user/:userId - Get review statistics for a user
router.get('/stats/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await reviewService.getUserReviewStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user review statistics',
      error: error.message
    });
  }
});

// GET /reviews/:id - Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: error.message
    });
  }
});

// POST /reviews - Create new review
router.post('/', async (req, res) => {
  try {
    const reviewData = req.body;
    
    // Validate required fields
    const requiredFields = ['userId', 'stationId', 'rating', 'comment', 'visitDate'];
    const missingFields = requiredFields.filter(field => !reviewData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Validate visit date
    const visitDate = new Date(reviewData.visitDate);
    if (isNaN(visitDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid visit date format'
      });
    }

    const review = await reviewService.createReview(reviewData);
    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User has already reviewed this station',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
});

// PUT /reviews/:id - Update review
router.put('/:id', async (req, res) => {
  try {
    const reviewData = req.body;
    
    // Validate rating if provided
    if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const review = await reviewService.updateReview(req.params.id, reviewData);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review,
      message: 'Review updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
});

// PATCH /reviews/:id/verify - Verify review
router.patch('/:id/verify', async (req, res) => {
  try {
    const review = await reviewService.verifyReview(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review,
      message: 'Review verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying review',
      error: error.message
    });
  }
});

// PATCH /reviews/:id/unverify - Unverify review
router.patch('/:id/unverify', async (req, res) => {
  try {
    const review = await reviewService.unverifyReview(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      data: review,
      message: 'Review unverified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unverifying review',
      error: error.message
    });
  }
});

// DELETE /reviews/:id - Delete review
router.delete('/:id', async (req, res) => {
  try {
    const review = await reviewService.deleteReview(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting review',
      error: error.message
    });
  }
});

module.exports = router;
