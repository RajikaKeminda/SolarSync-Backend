const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Station = require('../models/Station');
const ChargingSession = require('../models/ChargingSession');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const analyticsService = require('./analyticsService');
const notificationService = require('./notificationService');

class DashboardService {
  // Get complete dashboard data
  async getDashboardData(userId, ownerId) {
    try {
      if (userId) {
        return await this.getUserDashboard(userId);
      } else if (ownerId) {
        return await this.getBusinessDashboard(ownerId);
      }
    } catch (error) {
      throw new Error(`Error fetching dashboard data: ${error.message}`);
    }
  }

  // Get user dashboard data
  async getUserDashboard(userId) {
    try {
      const user = await User.findById(userId);
      const vehicles = await Vehicle.find({ ownerId: userId });
      const selectedVehicle = vehicles.find(v => v.isDefault) || vehicles[0];

      // Get active sessions
      const activeSessions = await ChargingSession.find({
        userId,
        status: 'active'
      }).populate('stationId vehicleId');

      // Get upcoming reservations
      const upcomingReservations = await Reservation.find({
        userId,
        status: 'confirmed',
        scheduledStartTime: { $gt: new Date() }
      }).populate('stationId').sort({ scheduledStartTime: 1 }).limit(5);

      // Get quick stats
      const quickStats = await this.getUserQuickStats(userId);

      // Get recent notifications
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5);

      return {
        type: 'user',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        vehicles,
        selectedVehicle,
        activeSessions,
        upcomingReservations,
        quickStats,
        notifications: notifications.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          createdAt: n.createdAt
        }))
      };
    } catch (error) {
      throw new Error(`Error fetching user dashboard: ${error.message}`);
    }
  }

  // Get business dashboard data
  async getBusinessDashboard(ownerId) {
    try {
      const owner = await User.findById(ownerId);
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get active sessions
      const activeSessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        status: 'active'
      }).populate('userId vehicleId stationId');

      // Get quick stats
      const quickStats = await this.getBusinessQuickStats(ownerId);

      // Get recent sessions
      const recentSessions = await ChargingSession.find({
        stationId: { $in: stationIds }
      }).populate('userId vehicleId stationId')
        .sort({ startTime: -1 })
        .limit(10);

      // Get station status
      const stationStatus = await this.getStationStatus(ownerId);

      return {
        type: 'business',
        owner: {
          id: owner._id,
          firstName: owner.firstName,
          lastName: owner.lastName,
          email: owner.email
        },
        stations,
        activeSessions,
        quickStats,
        recentSessions: recentSessions.map(session => ({
          id: session._id,
          stationName: session.stationId?.name || 'Unknown Station',
          energy: session.energyDelivered || 0,
          revenue: session.cost || 0,
          duration: session.duration || 0,
          startTime: session.startTime
        })),
        stationStatus
      };
    } catch (error) {
      throw new Error(`Error fetching business dashboard: ${error.message}`);
    }
  }

  // Get quick statistics
  async getQuickStats(userId, ownerId, period = 'month') {
    try {
      if (userId) {
        return await this.getUserQuickStats(userId, period);
      } else if (ownerId) {
        return await this.getBusinessQuickStats(ownerId, period);
      }
    } catch (error) {
      throw new Error(`Error fetching quick stats: ${error.message}`);
    }
  }

  // Get user quick stats
  async getUserQuickStats(userId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      const sessions = await ChargingSession.find({
        userId,
        startTime: dateFilter
      });

      const totalSessions = sessions.length;
      const totalEnergy = sessions.reduce((sum, session) => sum + (session.energyDelivered || 0), 0);
      const totalCost = sessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const carbonSavings = totalEnergy * 0.4; // 0.4 kg CO2 per kWh

      // Get active sessions count
      const activeSessions = await ChargingSession.countDocuments({
        userId,
        status: 'active'
      });

      // Get upcoming reservations count
      const upcomingReservations = await Reservation.countDocuments({
        userId,
        status: 'confirmed',
        scheduledStartTime: { $gt: new Date() }
      });

      return {
        totalSessions,
        totalEnergy,
        totalCost,
        carbonSavings,
        activeSessions,
        upcomingReservations,
        averageCostPerKwh: totalEnergy > 0 ? totalCost / totalEnergy : 0
      };
    } catch (error) {
      throw new Error(`Error fetching user quick stats: ${error.message}`);
    }
  }

  // Get business quick stats
  async getBusinessQuickStats(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      });

      const totalStations = stations.length;
      const totalSessions = sessions.length;
      const totalRevenue = sessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const totalEnergy = sessions.reduce((sum, session) => sum + (session.energyDelivered || 0), 0);

      // Get active sessions count
      const activeSessions = await ChargingSession.countDocuments({
        stationId: { $in: stationIds },
        status: 'active'
      });

      // Get average session duration
      const averageDuration = sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length 
        : 0;

      return {
        totalStations,
        totalSessions,
        totalRevenue,
        totalEnergy,
        activeSessions,
        averageDuration: Math.round(averageDuration),
        averageRevenuePerSession: totalSessions > 0 ? totalRevenue / totalSessions : 0
      };
    } catch (error) {
      throw new Error(`Error fetching business quick stats: ${error.message}`);
    }
  }

  // Get dashboard notifications
  async getDashboardNotifications(userId, limit = 5) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false
      });

      return {
        notifications: notifications.map(n => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          createdAt: n.createdAt,
          data: n.data
        })),
        unreadCount
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard notifications: ${error.message}`);
    }
  }

  // Get upcoming events
  async getUpcomingEvents(userId, ownerId, limit = 5) {
    try {
      const events = [];

      if (userId) {
        // Get upcoming reservations
        const reservations = await Reservation.find({
          userId,
          status: 'confirmed',
          scheduledStartTime: { $gt: new Date() }
        }).populate('stationId')
          .sort({ scheduledStartTime: 1 })
          .limit(parseInt(limit));

        events.push(...reservations.map(r => ({
          type: 'reservation',
          id: r._id,
          title: 'Upcoming Reservation',
          description: `Reservation at ${r.stationId?.name || 'Unknown Station'}`,
          scheduledTime: r.scheduledStartTime,
          data: r
        })));
      }

      if (ownerId) {
        // Get upcoming reservations for owner's stations
        const stations = await Station.find({ ownerId });
        const stationIds = stations.map(station => station._id);

        const reservations = await Reservation.find({
          stationId: { $in: stationIds },
          status: 'confirmed',
          scheduledStartTime: { $gt: new Date() }
        }).populate('userId stationId')
          .sort({ scheduledStartTime: 1 })
          .limit(parseInt(limit));

        events.push(...reservations.map(r => ({
          type: 'reservation',
          id: r._id,
          title: 'Upcoming Reservation',
          description: `Reservation by ${r.userId?.firstName || 'Unknown User'} at ${r.stationId?.name || 'Unknown Station'}`,
          scheduledTime: r.scheduledStartTime,
          data: r
        })));
      }

      return events.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    } catch (error) {
      throw new Error(`Error fetching upcoming events: ${error.message}`);
    }
  }

  // Get dashboard trends
  async getDashboardTrends(userId, ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      let sessions;

      if (userId) {
        sessions = await ChargingSession.find({
          userId,
          startTime: dateFilter
        });
      } else if (ownerId) {
        const stations = await Station.find({ ownerId });
        const stationIds = stations.map(station => station._id);
        sessions = await ChargingSession.find({
          stationId: { $in: stationIds },
          startTime: dateFilter
        });
      }

      // Group by day/week/month based on period
      const trends = this.groupSessionsByPeriod(sessions, period);
      return trends;
    } catch (error) {
      throw new Error(`Error fetching dashboard trends: ${error.message}`);
    }
  }

  // Get station status for business owners
  async getStationStatus(ownerId) {
    try {
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      const statusPromises = stations.map(async (station) => {
        const activeSessions = await ChargingSession.countDocuments({
          stationId: station._id,
          status: 'active'
        });

        const totalSessions = await ChargingSession.countDocuments({
          stationId: station._id,
          startTime: this.getDateFilter('month')
        });

        const monthlyRevenue = await ChargingSession.aggregate([
          {
            $match: {
              stationId: station._id,
              startTime: this.getDateFilter('month'),
              status: 'completed'
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$cost' }
            }
          }
        ]);

        return {
          id: station._id,
          name: station.name,
          address: station.address,
          status: station.status || 'online',
          totalPorts: station.totalPorts || 0,
          availablePorts: (station.totalPorts || 0) - activeSessions,
          activeSessions,
          totalSessions,
          monthlyRevenue: monthlyRevenue[0]?.totalRevenue || 0
        };
      });

      return await Promise.all(statusPromises);
    } catch (error) {
      throw new Error(`Error fetching station status: ${error.message}`);
    }
  }

  // Helper methods
  getDateFilter(period) {
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { $gte: startDate };
  }

  groupSessionsByPeriod(sessions, period) {
    const groups = {};
    
    sessions.forEach(session => {
      let key;
      const date = new Date(session.startTime);
      
      switch (period) {
        case 'week':
          key = date.toISOString().split('T')[0];
          break;
        case 'month':
          key = date.toISOString().substring(0, 7);
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = date.toISOString().substring(0, 7);
      }

      if (!groups[key]) {
        groups[key] = {
          date: key,
          sessions: 0,
          energy: 0,
          cost: 0
        };
      }

      groups[key].sessions++;
      groups[key].energy += session.energyDelivered || 0;
      groups[key].cost += session.cost || 0;
    });

    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }
}

module.exports = new DashboardService();

