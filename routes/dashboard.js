const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');

// GET /dashboard - Get complete dashboard data
router.get('/', async (req, res) => {
  try {
    const { userId, ownerId } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const dashboard = await dashboardService.getDashboardData(userId, ownerId);
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// GET /dashboard/quick-stats - Get quick statistics
router.get('/quick-stats', async (req, res) => {
  try {
    const { userId, ownerId, period = 'month' } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const stats = await dashboardService.getQuickStats(userId, ownerId, period);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quick stats',
      error: error.message
    });
  }
});

// GET /dashboard/notifications - Get dashboard notifications
router.get('/notifications', async (req, res) => {
  try {
    const { userId, limit = 5 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notifications = await dashboardService.getDashboardNotifications(userId, limit);
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard notifications',
      error: error.message
    });
  }
});

// GET /dashboard/upcoming - Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { userId, ownerId, limit = 5 } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const upcoming = await dashboardService.getUpcomingEvents(userId, ownerId, limit);
    res.json({
      success: true,
      data: upcoming
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events',
      error: error.message
    });
  }
});

// GET /dashboard/trends - Get dashboard trends
router.get('/trends', async (req, res) => {
  try {
    const { userId, ownerId, period = 'month' } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const trends = await dashboardService.getDashboardTrends(userId, ownerId, period);
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard trends',
      error: error.message
    });
  }
});

// GET /dashboard/station-status - Get station status for business owners
router.get('/station-status', async (req, res) => {
  try {
    const { ownerId } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const status = await dashboardService.getStationStatus(ownerId);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station status',
      error: error.message
    });
  }
});

module.exports = router;

