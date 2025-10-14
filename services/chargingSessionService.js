const ChargingSession = require('../models/ChargingSession');
const mongoose = require('mongoose');

// Create a new charging session
const createChargingSession = async (sessionData) => {
  try {
    const session = new ChargingSession(sessionData);
    const savedSession = await session.save();
    return savedSession;
  } catch (error) {
    throw error;
  }
};

// Get all charging sessions
const getAllChargingSessions = async () => {
  try {
    const sessions = await ChargingSession.find({})
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging session by ID
const getChargingSessionById = async (id) => {
  try {
    const session = await ChargingSession.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return session;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by user ID
const getChargingSessionsByUserId = async (userId) => {
  try {
    const sessions = await ChargingSession.find({ userId })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by vehicle ID
const getChargingSessionsByVehicleId = async (vehicleId) => {
  try {
    const sessions = await ChargingSession.find({ vehicleId })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by station ID
const getChargingSessionsByStationId = async (stationId) => {
  try {
    const sessions = await ChargingSession.find({ stationId })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by status
const getChargingSessionsByStatus = async (status) => {
  try {
    const sessions = await ChargingSession.find({ status })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by payment status
const getChargingSessionsByPaymentStatus = async (paymentStatus) => {
  try {
    const sessions = await ChargingSession.find({ paymentStatus })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get active charging sessions
const getActiveChargingSessions = async () => {
  try {
    const sessions = await ChargingSession.find({ 
      status: 'active',
      endTime: null 
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: 1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get completed charging sessions
const getCompletedChargingSessions = async () => {
  try {
    const sessions = await ChargingSession.find({ 
      status: 'completed',
      endTime: { $ne: null }
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ endTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by date range
const getChargingSessionsByDateRange = async (startDate, endDate) => {
  try {
    const sessions = await ChargingSession.find({
      startTime: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: 1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions for today
const getTodayChargingSessions = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const sessions = await ChargingSession.find({
      startTime: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: 1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by reservation ID
const getChargingSessionsByReservationId = async (reservationId) => {
  try {
    const sessions = await ChargingSession.find({ reservationId })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions with unpaid status
const getUnpaidChargingSessions = async () => {
  try {
    const sessions = await ChargingSession.find({ 
      paymentStatus: 'pending' 
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by energy delivered range
const getChargingSessionsByEnergyRange = async (minEnergy, maxEnergy) => {
  try {
    const sessions = await ChargingSession.find({
      energyDelivered: {
        $gte: minEnergy,
        $lte: maxEnergy
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ energyDelivered: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by cost range
const getChargingSessionsByCostRange = async (minCost, maxCost) => {
  try {
    const sessions = await ChargingSession.find({
      cost: {
        $gte: minCost,
        $lte: maxCost
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ cost: -1 });
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Update charging session by ID
const updateChargingSession = async (id, updateData) => {
  try {
    const session = await ChargingSession.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return session;
  } catch (error) {
    throw error;
  }
};

// Start charging session
const startChargingSession = async (id) => {
  try {
    const session = await ChargingSession.findByIdAndUpdate(
      id,
      { 
        status: 'active',
        startTime: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return session;
  } catch (error) {
    throw error;
  }
};

// End charging session
const endChargingSession = async (id, energyDelivered, cost) => {
  try {
    const session = await ChargingSession.findByIdAndUpdate(
      id,
      { 
        status: 'completed',
        endTime: new Date(),
        energyDelivered: energyDelivered || 0,
        cost: cost || 0
      },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return session;
  } catch (error) {
    throw error;
  }
};

// Cancel charging session
const cancelChargingSession = async (id) => {
  try {
    const session = await ChargingSession.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return session;
  } catch (error) {
    throw error;
  }
};

// Update payment status
const updatePaymentStatus = async (id, paymentStatus) => {
  try {
    const session = await ChargingSession.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return session;
  } catch (error) {
    throw error;
  }
};

// Delete charging session by ID
const deleteChargingSession = async (id) => {
  try {
    const session = await ChargingSession.findByIdAndDelete(id);
    return session;
  } catch (error) {
    throw error;
  }
};

// Get charging session statistics for a user
const getUserChargingSessionStats = async (userId) => {
  try {
    const stats = await ChargingSession.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalEnergyDelivered: { $sum: '$energyDelivered' },
          totalCost: { $sum: '$cost' },
          averageEnergyPerSession: { $avg: '$energyDelivered' },
          averageCostPerSession: { $avg: '$cost' },
          paidSessions: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      activeSessions: 0,
      cancelledSessions: 0,
      totalEnergyDelivered: 0,
      totalCost: 0,
      averageEnergyPerSession: 0,
      averageCostPerSession: 0,
      paidSessions: 0,
      pendingPayments: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get charging session statistics for a station
const getStationChargingSessionStats = async (stationId) => {
  try {
    const stats = await ChargingSession.aggregate([
      { $match: { stationId: mongoose.Types.ObjectId(stationId) } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalEnergyDelivered: { $sum: '$energyDelivered' },
          totalRevenue: { $sum: '$cost' },
          averageEnergyPerSession: { $avg: '$energyDelivered' },
          averageRevenuePerSession: { $avg: '$cost' },
          paidSessions: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      activeSessions: 0,
      cancelledSessions: 0,
      totalEnergyDelivered: 0,
      totalRevenue: 0,
      averageEnergyPerSession: 0,
      averageRevenuePerSession: 0,
      paidSessions: 0,
      pendingPayments: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get global charging session statistics
const getGlobalChargingSessionStats = async () => {
  try {
    const stats = await ChargingSession.aggregate([
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          cancelledSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalEnergyDelivered: { $sum: '$energyDelivered' },
          totalRevenue: { $sum: '$cost' },
          averageEnergyPerSession: { $avg: '$energyDelivered' },
          averageRevenuePerSession: { $avg: '$cost' },
          paidSessions: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalSessions: 0,
      completedSessions: 0,
      activeSessions: 0,
      cancelledSessions: 0,
      totalEnergyDelivered: 0,
      totalRevenue: 0,
      averageEnergyPerSession: 0,
      averageRevenuePerSession: 0,
      paidSessions: 0,
      pendingPayments: 0,
      failedPayments: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get recent charging sessions
const getRecentChargingSessions = async (limit = 10) => {
  try {
    const sessions = await ChargingSession.find({})
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ createdAt: -1 })
      .limit(limit);
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by station owner ID
const getChargingSessionsByStationOwnerId = async (ownerId) => {
  try {
    // First, get all stations owned by this owner
    const Station = require('../models/Station');
    const stations = await Station.find({ ownerId }).select('_id');
    const stationIds = stations.map(station => station._id);
    
    if (stationIds.length === 0) {
      return []; // No stations found for this owner
    }
    
    // Then get all charging sessions for these stations
    const sessions = await ChargingSession.find({ 
      stationId: { $in: stationIds } 
    })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address ownerId')
      .populate('reservationId', 'scheduledStartTime estimatedDuration')
      .sort({ startTime: -1 });
    
    return sessions;
  } catch (error) {
    throw error;
  }
};

// Get charging sessions by multiple criteria
const getChargingSessionsByCriteria = async (criteria) => {
  try {
    const query = {};
    
    if (criteria.status) {
      query.status = criteria.status;
    }
    
    if (criteria.paymentStatus) {
      query.paymentStatus = criteria.paymentStatus;
    }
    
    if (criteria.minEnergy || criteria.maxEnergy) {
      query.energyDelivered = {};
      if (criteria.minEnergy) query.energyDelivered.$gte = criteria.minEnergy;
      if (criteria.maxEnergy) query.energyDelivered.$lte = criteria.maxEnergy;
    }
    
    if (criteria.minCost || criteria.maxCost) {
      query.cost = {};
      if (criteria.minCost) query.cost.$gte = criteria.minCost;
      if (criteria.maxCost) query.cost.$lte = criteria.maxCost;
    }
    
    if (criteria.startDate || criteria.endDate) {
      query.startTime = {};
      if (criteria.startDate) query.startTime.$gte = new Date(criteria.startDate);
      if (criteria.endDate) query.startTime.$lte = new Date(criteria.endDate);
    }
    
    const sessions = await ChargingSession.find(query)
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'make model year')
      .populate('stationId', 'name address')
      .populate('reservationId', 'scheduledStartTime estimatedDuration');
    return sessions;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createChargingSession,
  getAllChargingSessions,
  getChargingSessionById,
  getChargingSessionsByUserId,
  getChargingSessionsByVehicleId,
  getChargingSessionsByStationId,
  getChargingSessionsByStatus,
  getChargingSessionsByPaymentStatus,
  getActiveChargingSessions,
  getCompletedChargingSessions,
  getChargingSessionsByDateRange,
  getTodayChargingSessions,
  getChargingSessionsByReservationId,
  getUnpaidChargingSessions,
  getChargingSessionsByEnergyRange,
  getChargingSessionsByCostRange,
  updateChargingSession,
  startChargingSession,
  endChargingSession,
  cancelChargingSession,
  updatePaymentStatus,
  deleteChargingSession,
  getUserChargingSessionStats,
  getStationChargingSessionStats,
  getGlobalChargingSessionStats,
  getRecentChargingSessions,
  getChargingSessionsByCriteria,
  getChargingSessionsByStationOwnerId
};
