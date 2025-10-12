const express = require('express');
const router = express.Router();
const reservationService = require('../services/reservationService');

// GET /reservations - Get all reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await reservationService.getAllReservations();
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations',
      error: error.message
    });
  }
});

// GET /reservations/recent - Get recent reservations
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const reservations = await reservationService.getRecentReservations(limit);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent reservations',
      error: error.message
    });
  }
});

// GET /reservations/active - Get active reservations
router.get('/active', async (req, res) => {
  try {
    const reservations = await reservationService.getActiveReservations();
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active reservations',
      error: error.message
    });
  }
});

// GET /reservations/today - Get today's reservations
router.get('/today', async (req, res) => {
  try {
    const reservations = await reservationService.getTodayReservations();
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s reservations',
      error: error.message
    });
  }
});

// GET /reservations/search - Search reservations by special requests
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required'
      });
    }
    
    const reservations = await reservationService.searchReservations(q);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching reservations',
      error: error.message
    });
  }
});

// GET /reservations/stats/global - Get global reservation statistics
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await reservationService.getGlobalReservationStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching global reservation statistics',
      error: error.message
    });
  }
});

// GET /reservations/status/:status - Get reservations by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed, cancelled, completed, or no_show'
      });
    }
    
    const reservations = await reservationService.getReservationsByStatus(status);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations by status',
      error: error.message
    });
  }
});

// GET /reservations/date-range - Get reservations by date range
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
    
    const reservations = await reservationService.getReservationsByDateRange(start, end);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations by date range',
      error: error.message
    });
  }
});

// GET /reservations/date/:date - Get reservations for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const reservations = await reservationService.getReservationsByDate(date);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations for date',
      error: error.message
    });
  }
});

// GET /reservations/user/:userId - Get reservations by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await reservationService.getReservationsByUserId(userId);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations by user',
      error: error.message
    });
  }
});

// GET /reservations/user/:userId/upcoming - Get upcoming reservations for a user
router.get('/user/:userId/upcoming', async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await reservationService.getUpcomingReservationsByUserId(userId);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming reservations for user',
      error: error.message
    });
  }
});

// GET /reservations/user/:userId/stats - Get reservation statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await reservationService.getUserReservationStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user reservation statistics',
      error: error.message
    });
  }
});

// GET /reservations/station/:stationId - Get reservations by station ID
router.get('/station/:stationId', async (req, res) => {
  try {
    const { stationId } = req.params;
    const reservations = await reservationService.getReservationsByStationId(stationId);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations by station',
      error: error.message
    });
  }
});

// GET /reservations/station/:stationId/upcoming - Get upcoming reservations for a station
router.get('/station/:stationId/upcoming', async (req, res) => {
  try {
    const { stationId } = req.params;
    const reservations = await reservationService.getUpcomingReservationsByStationId(stationId);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming reservations for station',
      error: error.message
    });
  }
});

// GET /reservations/station/:stationId/stats - Get reservation statistics for a station
router.get('/station/:stationId/stats', async (req, res) => {
  try {
    const { stationId } = req.params;
    const stats = await reservationService.getStationReservationStats(stationId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station reservation statistics',
      error: error.message
    });
  }
});

// GET /reservations/vehicle/:vehicleId - Get reservations by vehicle ID
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const reservations = await reservationService.getReservationsByVehicleId(vehicleId);
    res.json({
      success: true,
      data: reservations,
      count: reservations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservations by vehicle',
      error: error.message
    });
  }
});

// GET /reservations/check-availability - Check station availability
router.get('/check-availability', async (req, res) => {
  try {
    const { stationId, startTime, duration } = req.query;
    
    if (!stationId || !startTime || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Station ID, start time, and duration parameters are required'
      });
    }
    
    const start = new Date(startTime);
    const durationNum = parseInt(duration);
    
    if (isNaN(start.getTime()) || isNaN(durationNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start time or duration format'
      });
    }
    
    const isAvailable = await reservationService.checkStationAvailability(stationId, start, durationNum);
    
    res.json({
      success: true,
      data: { isAvailable }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking station availability',
      error: error.message
    });
  }
});

// GET /reservations/:id - Get reservation by ID
router.get('/:id', async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching reservation',
      error: error.message
    });
  }
});

// POST /reservations - Create new reservation
router.post('/', async (req, res) => {
  try {
    const reservationData = req.body;
    
    // Validate required fields
    const requiredFields = ['userId', 'stationId', 'vehicleId', 'scheduledStartTime', 'estimatedDuration'];
    const missingFields = requiredFields.filter(field => !reservationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate scheduled start time
    const startTime = new Date(reservationData.scheduledStartTime);
    if (isNaN(startTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scheduled start time format'
      });
    }

    if (startTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled start time cannot be in the past'
      });
    }

    // Validate estimated duration
    if (reservationData.estimatedDuration < 1 || reservationData.estimatedDuration > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Estimated duration must be between 1 and 1440 minutes'
      });
    }

    // Validate status if provided
    if (reservationData.status && !['confirmed', 'cancelled', 'completed', 'no_show'].includes(reservationData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed, cancelled, completed, or no_show'
      });
    }

    // Check station availability
    const isAvailable = await reservationService.checkStationAvailability(
      reservationData.stationId,
      startTime,
      reservationData.estimatedDuration
    );

    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: 'Station is not available at the requested time'
      });
    }

    const reservation = await reservationService.createReservation(reservationData);
    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating reservation',
      error: error.message
    });
  }
});

// PUT /reservations/:id - Update reservation
router.put('/:id', async (req, res) => {
  try {
    const reservationData = req.body;
    
    // Validate scheduled start time if provided
    if (reservationData.scheduledStartTime) {
      const startTime = new Date(reservationData.scheduledStartTime);
      if (isNaN(startTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid scheduled start time format'
        });
      }

      if (startTime < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled start time cannot be in the past'
        });
      }
    }

    // Validate estimated duration if provided
    if (reservationData.estimatedDuration && 
        (reservationData.estimatedDuration < 1 || reservationData.estimatedDuration > 1440)) {
      return res.status(400).json({
        success: false,
        message: 'Estimated duration must be between 1 and 1440 minutes'
      });
    }

    // Validate status if provided
    if (reservationData.status && !['confirmed', 'cancelled', 'completed', 'no_show'].includes(reservationData.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be confirmed, cancelled, completed, or no_show'
      });
    }
    
    const reservation = await reservationService.updateReservation(req.params.id, reservationData);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation,
      message: 'Reservation updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating reservation',
      error: error.message
    });
  }
});

// PATCH /reservations/:id/cancel - Cancel reservation
router.patch('/:id/cancel', async (req, res) => {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling reservation',
      error: error.message
    });
  }
});

// PATCH /reservations/:id/complete - Complete reservation
router.patch('/:id/complete', async (req, res) => {
  try {
    const reservation = await reservationService.completeReservation(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation,
      message: 'Reservation completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing reservation',
      error: error.message
    });
  }
});

// PATCH /reservations/:id/no-show - Mark reservation as no-show
router.patch('/:id/no-show', async (req, res) => {
  try {
    const reservation = await reservationService.markReservationAsNoShow(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation,
      message: 'Reservation marked as no-show successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking reservation as no-show',
      error: error.message
    });
  }
});

// DELETE /reservations/:id - Delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await reservationService.deleteReservation(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting reservation',
      error: error.message
    });
  }
});

module.exports = router;
