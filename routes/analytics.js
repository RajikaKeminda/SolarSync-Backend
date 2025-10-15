const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');

// GET /analytics - Get user analytics
router.get('/', async (req, res) => {
  try {
    const { userId, period = 'month' } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const analytics = await analyticsService.getUserAnalytics(userId, period);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// GET /analytics/business - Get business analytics
router.get('/business', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const analytics = await analyticsService.getBusinessAnalytics(ownerId, period);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business analytics',
      error: error.message
    });
  }
});

// GET /analytics/monthly/:month - Get monthly report
router.get('/monthly/:month', async (req, res) => {
  try {
    const { month } = req.params;
    const { userId, ownerId } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const report = await analyticsService.getMonthlyReport(month, userId, ownerId);
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching monthly report',
      error: error.message
    });
  }
});

// GET /analytics/dashboard - Get dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const { userId, ownerId } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const dashboard = await analyticsService.getDashboardSummary(userId, ownerId);
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard summary',
      error: error.message
    });
  }
});

// GET /analytics/trends - Get usage trends
router.get('/trends', async (req, res) => {
  try {
    const { userId, ownerId, period = 'month' } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const trends = await analyticsService.getUsageTrends(userId, ownerId, period);
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching usage trends',
      error: error.message
    });
  }
});

module.exports = router;

