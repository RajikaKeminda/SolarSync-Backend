const Reservation = require('../models/Reservation');
const mongoose = require('mongoose');

// Create a new reservation
const createReservation = async (reservationData) => {
  try {
    const reservation = new Reservation(reservationData);
    const savedReservation = await reservation.save();
    return savedReservation;
  } catch (error) {
    throw error;
  }
};

// Get all reservations
const getAllReservations = async () => {
  try {
    const reservations = await Reservation.find({})
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: -1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservation by ID
const getReservationById = async (id) => {
  try {
    const reservation = await Reservation.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year');
    return reservation;
  } catch (error) {
    throw error;
  }
};

// Get reservations by user ID
const getReservationsByUserId = async (userId) => {
  try {
    const reservations = await Reservation.find({ userId })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: -1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservations by station ID
const getReservationsByStationId = async (stationId) => {
  try {
    const reservations = await Reservation.find({ stationId })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: -1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservations by vehicle ID
const getReservationsByVehicleId = async (vehicleId) => {
  try {
    const reservations = await Reservation.find({ vehicleId })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: -1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservations by status
const getReservationsByStatus = async (status) => {
  try {
    const reservations = await Reservation.find({ status })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: -1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get active reservations (confirmed and upcoming)
const getActiveReservations = async () => {
  try {
    const now = new Date();
    const reservations = await Reservation.find({
      status: 'confirmed',
      scheduledStartTime: { $gt: now }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: 1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get upcoming reservations for a user
const getUpcomingReservationsByUserId = async (userId) => {
  try {
    const now = new Date();
    const reservations = await Reservation.find({
      userId,
      status: 'confirmed',
      scheduledStartTime: { $gt: now }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: 1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get upcoming reservations for a station
const getUpcomingReservationsByStationId = async (stationId) => {
  try {
    const now = new Date();
    const reservations = await Reservation.find({
      stationId,
      status: 'confirmed',
      scheduledStartTime: { $gt: now }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: 1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservations by date range
const getReservationsByDateRange = async (startDate, endDate) => {
  try {
    const reservations = await Reservation.find({
      scheduledStartTime: {
        $gte: startDate,
        $lte: endDate
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: 1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservations for today
const getTodayReservations = async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const reservations = await Reservation.find({
      scheduledStartTime: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: 1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Get reservations for a specific date
const getReservationsByDate = async (date) => {
  try {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
    
    const reservations = await Reservation.find({
      scheduledStartTime: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: 1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Check for overlapping reservations at a station
const checkStationAvailability = async (stationId, startTime, duration) => {
  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (duration * 60000));
    
    const overlappingReservations = await Reservation.find({
      stationId,
      status: 'confirmed',
      $or: [
        {
          scheduledStartTime: {
            $gte: start,
            $lt: end
          }
        },
        {
          $expr: {
            $and: [
              { $gte: ['$scheduledStartTime', start] },
              { $lt: ['$scheduledStartTime', end] }
          ]
        }
      }
      ]
    });
    
    return overlappingReservations.length === 0;
  } catch (error) {
    throw error;
  }
};

// Update reservation by ID
const updateReservation = async (id, updateData) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year');
    return reservation;
  } catch (error) {
    throw error;
  }
};

// Cancel reservation
const cancelReservation = async (id) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year');
    return reservation;
  } catch (error) {
    throw error;
  }
};

// Complete reservation
const completeReservation = async (id) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: 'completed' },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year');
    return reservation;
  } catch (error) {
    throw error;
  }
};

// Mark reservation as no-show
const markReservationAsNoShow = async (id) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status: 'no_show' },
      { new: true, runValidators: true }
    )
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year');
    return reservation;
  } catch (error) {
    throw error;
  }
};

// Delete reservation by ID
const deleteReservation = async (id) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(id);
    return reservation;
  } catch (error) {
    throw error;
  }
};

// Get reservation statistics for a user
const getUserReservationStats = async (userId) => {
  try {
    const stats = await Reservation.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          confirmedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          },
          averageDuration: { $avg: '$estimatedDuration' }
        }
      }
    ]);
    
    return stats[0] || {
      totalReservations: 0,
      confirmedReservations: 0,
      completedReservations: 0,
      cancelledReservations: 0,
      noShowReservations: 0,
      averageDuration: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get reservation statistics for a station
const getStationReservationStats = async (stationId) => {
  try {
    const stats = await Reservation.aggregate([
      { $match: { stationId: mongoose.Types.ObjectId(stationId) } },
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          confirmedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          },
          averageDuration: { $avg: '$estimatedDuration' }
        }
      }
    ]);
    
    return stats[0] || {
      totalReservations: 0,
      confirmedReservations: 0,
      completedReservations: 0,
      cancelledReservations: 0,
      noShowReservations: 0,
      averageDuration: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get global reservation statistics
const getGlobalReservationStats = async () => {
  try {
    const stats = await Reservation.aggregate([
      {
        $group: {
          _id: null,
          totalReservations: { $sum: 1 },
          confirmedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShowReservations: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          },
          averageDuration: { $avg: '$estimatedDuration' }
        }
      }
    ]);
    
    return stats[0] || {
      totalReservations: 0,
      confirmedReservations: 0,
      completedReservations: 0,
      cancelledReservations: 0,
      noShowReservations: 0,
      averageDuration: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get recent reservations
const getRecentReservations = async (limit = 10) => {
  try {
    const reservations = await Reservation.find({})
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ createdAt: -1 })
      .limit(limit);
    return reservations;
  } catch (error) {
    throw error;
  }
};

// Search reservations by special requests
const searchReservations = async (searchTerm) => {
  try {
    const reservations = await Reservation.find({
      specialRequests: { $regex: searchTerm, $options: 'i' }
    })
      .populate('userId', 'firstName lastName email')
      .populate('stationId', 'name address')
      .populate('vehicleId', 'make model year')
      .sort({ scheduledStartTime: -1 });
    return reservations;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  getReservationsByUserId,
  getReservationsByStationId,
  getReservationsByVehicleId,
  getReservationsByStatus,
  getActiveReservations,
  getUpcomingReservationsByUserId,
  getUpcomingReservationsByStationId,
  getReservationsByDateRange,
  getTodayReservations,
  getReservationsByDate,
  checkStationAvailability,
  updateReservation,
  cancelReservation,
  completeReservation,
  markReservationAsNoShow,
  deleteReservation,
  getUserReservationStats,
  getStationReservationStats,
  getGlobalReservationStats,
  getRecentReservations,
  searchReservations
};
