const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const aiSuggestionsService = require('../services/aiSuggestionsService');

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

// GET /analytics/business/metrics - Get business metrics
router.get('/business/metrics', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const metrics = await analyticsService.getBusinessMetrics(ownerId, period);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business metrics',
      error: error.message
    });
  }
});

// GET /analytics/business/revenue - Get revenue trends
router.get('/business/revenue', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const revenue = await analyticsService.getRevenueTrends(ownerId, period);
    res.json({
      success: true,
      data: revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue trends',
      error: error.message
    });
  }
});

// GET /analytics/business/station-performance - Get station performance
router.get('/business/station-performance', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const performance = await analyticsService.getStationPerformance(ownerId, period);
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station performance',
      error: error.message
    });
  }
});

// GET /analytics/business/peak-hours - Get peak hours analysis
router.get('/business/peak-hours', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const peakHours = await analyticsService.getPeakHoursAnalysis(ownerId, period);
    res.json({
      success: true,
      data: peakHours
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching peak hours analysis',
      error: error.message
    });
  }
});

// GET /analytics/business/customer-insights - Get customer insights
router.get('/business/customer-insights', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;
    
    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    const insights = await analyticsService.getCustomerInsights(ownerId, period);
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customer insights',
      error: error.message
    });
  }
});

// GET /analytics/ai-suggestions - Get AI-powered business suggestions
router.get('/ai-suggestions', async (req, res) => {
  try {
    const { ownerId, period = 'month' } = req.query;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required'
      });
    }

    // Gather all analytics data for AI analysis
    const [metrics, revenue, stationPerformance, peakHours, customerInsights] = await Promise.all([
      analyticsService.getBusinessMetrics(ownerId, period),
      analyticsService.getRevenueTrends(ownerId, period),
      analyticsService.getStationPerformance(ownerId, period),
      analyticsService.getPeakHoursAnalysis(ownerId, period),
      analyticsService.getCustomerInsights(ownerId, period)
    ]);

    // Prepare data for AI analysis
    const analyticsData = {
      totalRevenue: metrics.totalRevenue || 0,
      totalSessions: metrics.totalSessions || 0,
      totalEnergy: metrics.totalEnergy || 0,
      averageSessionDuration: metrics.averageSessionDuration || 0,
      growthRate: metrics.growthRate || 0,
      customerSatisfaction: customerInsights.averageRating || 4.5,
      topPerformingStation: stationPerformance.stations?.[0]?.name || 'N/A',
      stationPerformance: stationPerformance.stations || [],
      peakHours: peakHours.peakHours || [],
      period
    };

    // Generate AI suggestions
    const suggestions = await aiSuggestionsService.generateBusinessSuggestions(analyticsData);

    res.json({
      success: true,
      data: {
        suggestions,
        generatedAt: new Date(),
        basedOnPeriod: period
      }
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating AI suggestions',
      error: error.message
    });
  }
});

module.exports = router;

