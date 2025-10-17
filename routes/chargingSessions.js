const express = require('express');
const router = express.Router();
const chargingSessionService = require('../services/chargingSessionService');

// GET /charging-sessions - Get all charging sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await chargingSessionService.getAllChargingSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/recent - Get recent charging sessions
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sessions = await chargingSessionService.getRecentChargingSessions(limit);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent charging sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/active - Get active charging sessions
router.get('/active', async (req, res) => {
  try {
    const sessions = await chargingSessionService.getActiveChargingSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active charging sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/completed - Get completed charging sessions
router.get('/completed', async (req, res) => {
  try {
    const sessions = await chargingSessionService.getCompletedChargingSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching completed charging sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/today - Get today's charging sessions
router.get('/today', async (req, res) => {
  try {
    const sessions = await chargingSessionService.getTodayChargingSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s charging sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/unpaid - Get unpaid charging sessions
router.get('/unpaid', async (req, res) => {
  try {
    const sessions = await chargingSessionService.getUnpaidChargingSessions();
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unpaid charging sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/criteria - Get charging sessions by multiple criteria
router.get('/criteria', async (req, res) => {
  try {
    const criteria = req.query;
    const sessions = await chargingSessionService.getChargingSessionsByCriteria(criteria);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by criteria',
      error: error.message
    });
  }
});

// GET /charging-sessions/stats/global - Get global charging session statistics
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await chargingSessionService.getGlobalChargingSessionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching global charging session statistics',
      error: error.message
    });
  }
});

// GET /charging-sessions/status/:status - Get charging sessions by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['scheduled', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be scheduled, active, completed, or cancelled'
      });
    }
    
    const sessions = await chargingSessionService.getChargingSessionsByStatus(status);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by status',
      error: error.message
    });
  }
});

// GET /charging-sessions/payment-status/:status - Get charging sessions by payment status
router.get('/payment-status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status. Must be pending, paid, or failed'
      });
    }
    
    const sessions = await chargingSessionService.getChargingSessionsByPaymentStatus(status);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by payment status',
      error: error.message
    });
  }
});

// GET /charging-sessions/date-range - Get charging sessions by date range
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
    
    const sessions = await chargingSessionService.getChargingSessionsByDateRange(start, end);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by date range',
      error: error.message
    });
  }
});

// GET /charging-sessions/energy-range - Get charging sessions by energy delivered range
router.get('/energy-range', async (req, res) => {
  try {
    const { minEnergy, maxEnergy } = req.query;
    
    if (!minEnergy || !maxEnergy) {
      return res.status(400).json({
        success: false,
        message: 'Min energy and max energy parameters are required'
      });
    }
    
    const min = parseFloat(minEnergy);
    const max = parseFloat(maxEnergy);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid energy format'
      });
    }
    
    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Min energy must be less than max energy'
      });
    }
    
    const sessions = await chargingSessionService.getChargingSessionsByEnergyRange(min, max);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by energy range',
      error: error.message
    });
  }
});

// GET /charging-sessions/cost-range - Get charging sessions by cost range
router.get('/cost-range', async (req, res) => {
  try {
    const { minCost, maxCost } = req.query;
    
    if (!minCost || !maxCost) {
      return res.status(400).json({
        success: false,
        message: 'Min cost and max cost parameters are required'
      });
    }
    
    const min = parseFloat(minCost);
    const max = parseFloat(maxCost);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cost format'
      });
    }
    
    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Min cost must be less than max cost'
      });
    }
    
    const sessions = await chargingSessionService.getChargingSessionsByCostRange(min, max);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by cost range',
      error: error.message
    });
  }
});

// GET /charging-sessions/user/:userId - Get charging sessions by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await chargingSessionService.getChargingSessionsByUserId(userId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by user',
      error: error.message
    });
  }
});

// GET /charging-sessions/user/:userId/stats - Get charging session statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await chargingSessionService.getUserChargingSessionStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user charging session statistics',
      error: error.message
    });
  }
});

// GET /charging-sessions/station/:stationId - Get charging sessions by station ID
router.get('/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const sessions = await chargingSessionService.getChargingSessionsByStationId(stationId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by station',
      error: error.message
    });
  }
});

// GET /charging-sessions/station/:stationId/stats - Get charging session statistics for a station
router.get('/station/:stationId/stats', async (req, res) => {
  try {
    const { stationId } = req.params;
    const stats = await chargingSessionService.getStationChargingSessionStats(stationId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station charging session statistics',
      error: error.message
    });
  }
});

// GET /charging-sessions/vehicle/:vehicleId - Get charging sessions by vehicle ID
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const sessions = await chargingSessionService.getChargingSessionsByVehicleId(vehicleId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by vehicle',
      error: error.message
    });
  }
});

// GET /charging-sessions/reservation/:reservationId - Get charging sessions by reservation ID
router.get('/reservation/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;
    const sessions = await chargingSessionService.getChargingSessionsByReservationId(reservationId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by reservation',
      error: error.message
    });
  }
});

// GET /charging-sessions/station-owner/:ownerId - Get charging sessions by station owner ID
router.get('/station-owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const sessions = await chargingSessionService.getChargingSessionsByStationOwnerId(ownerId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging sessions by station owner',
      error: error.message
    });
  }
});

// GET /charging-sessions/:id - Get charging session by ID
router.get('/:id', async (req, res) => {
  try {
    const session = await chargingSessionService.getChargingSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching charging session',
      error: error.message
    });
  }
});

// POST /charging-sessions - Create new charging session
router.post('/', async (req, res) => {
  try {
    const sessionData = req.body;
    
    // Validate required fields
    const requiredFields = ['userId', 'vehicleId', 'stationId', 'startTime'];
    const missingFields = requiredFields.filter(field => !sessionData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate start time
    const startTime = new Date(sessionData.startTime);
    if (isNaN(startTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start time format'
      });
    }

    // Validate energy delivered
    if (sessionData.energyDelivered < 0 || sessionData.energyDelivered > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Energy delivered must be between 0 and 1000 kWh'
      });
    }

    // Validate cost
    if (sessionData.cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost must be a positive number'
      });
    }

    // Validate status if provided
    if (sessionData.status && !['scheduled', 'active', 'completed', 'cancelled'].includes(sessionData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be scheduled, active, completed, or cancelled'
      });
    }

    // Validate payment status if provided
    if (sessionData.paymentStatus && !['pending', 'paid', 'failed'].includes(sessionData.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status. Must be pending, paid, or failed'
      });
    }

    const session = await chargingSessionService.createChargingSession(sessionData);
    res.status(201).json({
      success: true,
      data: session,
      message: 'Charging session created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating charging session',
      error: error.message
    });
  }
});

// PUT /charging-sessions/:id - Update charging session
router.put('/:id', async (req, res) => {
  try {
    const sessionData = req.body;
    
    // Validate start time if provided
    if (sessionData.startTime) {
      const startTime = new Date(sessionData.startTime);
      if (isNaN(startTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start time format'
        });
      }
    }

    // Validate end time if provided
    if (sessionData.endTime) {
      const endTime = new Date(sessionData.endTime);
      if (isNaN(endTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid end time format'
        });
      }
    }

    // Validate energy delivered if provided
    if (sessionData.energyDelivered !== undefined && 
        (sessionData.energyDelivered < 0 || sessionData.energyDelivered > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Energy delivered must be between 0 and 1000 kWh'
      });
    }

    // Validate cost if provided
    if (sessionData.cost !== undefined && sessionData.cost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cost must be a positive number'
      });
    }

    // Validate status if provided
    if (sessionData.status && !['scheduled', 'active', 'completed', 'cancelled'].includes(sessionData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be scheduled, active, completed, or cancelled'
      });
    }

    // Validate payment status if provided
    if (sessionData.paymentStatus && !['pending', 'paid', 'failed'].includes(sessionData.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status. Must be pending, paid, or failed'
      });
    }
    
    const session = await chargingSessionService.updateChargingSession(req.params.id, sessionData);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Charging session updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating charging session',
      error: error.message
    });
  }
});

// PATCH /charging-sessions/:id/start - Start charging session
router.patch('/:id/start', async (req, res) => {
  try {
    const session = await chargingSessionService.startChargingSession(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Charging session started successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting charging session',
      error: error.message
    });
  }
});

// PATCH /charging-sessions/:id/end - End charging session
router.patch('/:id/end', async (req, res) => {
  try {
    const { energyDelivered, cost } = req.body;
    
    const session = await chargingSessionService.endChargingSession(req.params.id, energyDelivered, cost);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Charging session ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending charging session',
      error: error.message
    });
  }
});

// PATCH /charging-sessions/:id/cancel - Cancel charging session
router.patch('/:id/cancel', async (req, res) => {
  try {
    const session = await chargingSessionService.cancelChargingSession(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Charging session cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling charging session',
      error: error.message
    });
  }
});

// PATCH /charging-sessions/:id/payment-status - Update payment status
router.patch('/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    
    if (!paymentStatus || !['pending', 'paid', 'failed'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment status (pending, paid, failed) is required'
      });
    }
    
    const session = await chargingSessionService.updatePaymentStatus(req.params.id, paymentStatus);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }

    res.json({
      success: true,
      data: session,
      message: 'Payment status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment status',
      error: error.message
    });
  }
});

// DELETE /charging-sessions/:id - Delete charging session
router.delete('/:id', async (req, res) => {
  try {
    const session = await chargingSessionService.deleteChargingSession(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Charging session not found'
      });
    }

    res.json({
      success: true,
      message: 'Charging session deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting charging session',
      error: error.message
    });
  }
});

// GET /charging-sessions/dashboard/active - Get active sessions for dashboard
router.get('/dashboard/active', async (req, res) => {
  try {
    const { userId, ownerId } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const sessions = await chargingSessionService.getDashboardActiveSessions(userId, ownerId);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard active sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/dashboard/recent - Get recent sessions for dashboard
router.get('/dashboard/recent', async (req, res) => {
  try {
    const { userId, ownerId, limit = 5 } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const sessions = await chargingSessionService.getDashboardRecentSessions(userId, ownerId, limit);
    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard recent sessions',
      error: error.message
    });
  }
});

// GET /charging-sessions/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { userId, ownerId, period = 'month' } = req.query;
    
    if (!userId && !ownerId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or Owner ID is required'
      });
    }

    const stats = await chargingSessionService.getDashboardStats(userId, ownerId, period);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

module.exports = router;
