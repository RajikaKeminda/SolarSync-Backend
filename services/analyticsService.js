const ChargingSession = require('../models/ChargingSession');
const Reservation = require('../models/Reservation');
const Station = require('../models/Station');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');

class AnalyticsService {
  // Get user analytics
  async getUserAnalytics(userId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get user's charging sessions
      const sessions = await ChargingSession.find({
        userId,
        startTime: dateFilter
      }).populate('stationId vehicleId');

      // Calculate analytics
      const totalSessions = sessions.length;
      const totalEnergyConsumed = sessions.reduce((sum, session) => sum + (session.energyDelivered || 0), 0);
      const totalCost = sessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const averageSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length 
        : 0;

      // Calculate carbon savings (assuming 0.4 kg CO2 per kWh from grid)
      const carbonSavings = totalEnergyConsumed * 0.4;

      // Get favorite stations
      const stationUsage = {};
      sessions.forEach(session => {
        if (session.stationId && session.stationId.name) {
          stationUsage[session.stationId.name] = (stationUsage[session.stationId.name] || 0) + 1;
        }
      });
      
      const favoriteStations = Object.entries(stationUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);

      // Get monthly breakdown
      const monthlyStats = await this.getMonthlyBreakdown(userId, period);

      return {
        totalChargingSessions: totalSessions,
        totalEnergyConsumed,
        totalCost,
        averageSessionDuration: Math.round(averageSessionDuration),
        carbonSavings,
        favoriteStations,
        monthlyStats
      };
    } catch (error) {
      throw new Error(`Error calculating user analytics: ${error.message}`);
    }
  }

  // Get business analytics
  async getBusinessAnalytics(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get owner's stations
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get charging sessions for owner's stations
      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      }).populate('userId vehicleId stationId');

      // Calculate analytics
      const totalStations = stations.length;
      const totalSessions = sessions.length;
      const totalRevenue = sessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const averageSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length 
        : 0;

      // Get active sessions
      const activeSessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        status: 'active'
      }).countDocuments();

      // Get top performing station
      const stationPerformance = {};
      sessions.forEach(session => {
        if (session.stationId && session.stationId.name) {
          if (!stationPerformance[session.stationId.name]) {
            stationPerformance[session.stationId.name] = { sessions: 0, revenue: 0 };
          }
          stationPerformance[session.stationId.name].sessions++;
          stationPerformance[session.stationId.name].revenue += session.cost || 0;
        }
      });

      const topPerformingStation = Object.entries(stationPerformance)
        .sort(([,a], [,b]) => b.revenue - a.revenue)[0]?.[0] || 'No data';

      // Get recent sessions
      const recentSessions = sessions
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 10)
        .map(session => ({
          id: session._id,
          stationName: session.stationId?.name || 'Unknown Station',
          energy: session.energyDelivered || 0,
          revenue: session.cost || 0,
          duration: session.duration || 0
        }));

      // Get monthly stats
      const monthlyStats = await this.getBusinessMonthlyBreakdown(ownerId, period);

      return {
        totalStations,
        totalSessions,
        totalRevenue,
        monthlyRevenue: totalRevenue, // For current period
        activeChargingSessions: activeSessions,
        averageSessionDuration: Math.round(averageSessionDuration),
        topPerformingStation,
        recentSessions,
        monthlyStats
      };
    } catch (error) {
      throw new Error(`Error calculating business analytics: ${error.message}`);
    }
  }

  // Get dashboard summary
  async getDashboardSummary(userId, ownerId) {
    try {
      if (userId) {
        // User dashboard
        const user = await User.findById(userId);
        const vehicles = await Vehicle.find({ ownerId: userId });
        const activeSessions = await ChargingSession.find({
          userId,
          status: 'active'
        }).populate('stationId vehicleId');

        const upcomingReservations = await Reservation.find({
          userId,
          status: 'confirmed',
          scheduledStartTime: { $gt: new Date() }
        }).populate('stationId').sort({ scheduledStartTime: 1 }).limit(5);

        return {
          type: 'user',
          user: {
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email
          },
          vehicles,
          activeSessions,
          upcomingReservations,
          quickStats: await this.getUserQuickStats(userId)
        };
      } else if (ownerId) {
        // Business dashboard
        const owner = await User.findById(ownerId);
        const stations = await Station.find({ ownerId });
        const stationIds = stations.map(station => station._id);

        const activeSessions = await ChargingSession.find({
          stationId: { $in: stationIds },
          status: 'active'
        }).populate('userId vehicleId stationId');

        return {
          type: 'business',
          owner: {
            firstName: owner?.firstName,
            lastName: owner?.lastName,
            email: owner?.email
          },
          stations,
          activeSessions,
          quickStats: await this.getBusinessQuickStats(ownerId)
        };
      }
    } catch (error) {
      throw new Error(`Error fetching dashboard summary: ${error.message}`);
    }
  }

  // Get usage trends
  async getUsageTrends(userId, ownerId, period = 'month') {
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
      throw new Error(`Error fetching usage trends: ${error.message}`);
    }
  }

  // Get monthly report
  async getMonthlyReport(month, userId, ownerId) {
    try {
      const startDate = new Date(month + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      if (userId) {
        const sessions = await ChargingSession.find({
          userId,
          startTime: { $gte: startDate, $lte: endDate }
        }).populate('stationId vehicleId');

        return {
          type: 'user',
          month,
          sessions: sessions.length,
          totalEnergy: sessions.reduce((sum, s) => sum + (s.energyDelivered || 0), 0),
          totalCost: sessions.reduce((sum, s) => sum + (s.cost || 0), 0),
          averageDuration: sessions.length > 0 
            ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
            : 0,
          sessionsData: sessions
        };
      } else if (ownerId) {
        const stations = await Station.find({ ownerId });
        const stationIds = stations.map(station => station._id);
        
        const sessions = await ChargingSession.find({
          stationId: { $in: stationIds },
          startTime: { $gte: startDate, $lte: endDate }
        }).populate('userId vehicleId stationId');

        return {
          type: 'business',
          month,
          sessions: sessions.length,
          totalRevenue: sessions.reduce((sum, s) => sum + (s.cost || 0), 0),
          totalEnergy: sessions.reduce((sum, s) => sum + (s.energyDelivered || 0), 0),
          averageDuration: sessions.length > 0 
            ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
            : 0,
          sessionsData: sessions
        };
      }
    } catch (error) {
      throw new Error(`Error generating monthly report: ${error.message}`);
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

  async getUserQuickStats(userId) {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const sessions = await ChargingSession.find({
      userId,
      startTime: { $gte: thisMonth }
    });

    return {
      totalSessions: sessions.length,
      totalEnergy: sessions.reduce((sum, s) => sum + (s.energyDelivered || 0), 0),
      totalCost: sessions.reduce((sum, s) => sum + (s.cost || 0), 0),
      carbonSavings: sessions.reduce((sum, s) => sum + (s.energyDelivered || 0), 0) * 0.4
    };
  }

  async getBusinessQuickStats(ownerId) {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const stations = await Station.find({ ownerId });
    const stationIds = stations.map(station => station._id);
    
    const sessions = await ChargingSession.find({
      stationId: { $in: stationIds },
      startTime: { $gte: thisMonth }
    });

    return {
      totalStations: stations.length,
      totalSessions: sessions.length,
      totalRevenue: sessions.reduce((sum, s) => sum + (s.cost || 0), 0),
      activeSessions: await ChargingSession.find({
        stationId: { $in: stationIds },
        status: 'active'
      }).countDocuments()
    };
  }

  async getMonthlyBreakdown(userId, period) {
    const sessions = await ChargingSession.find({
      userId,
      startTime: this.getDateFilter(period)
    });

    const monthlyData = {};
    sessions.forEach(session => {
      const month = session.startTime.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          sessionsCount: 0,
          energyConsumed: 0,
          totalCost: 0
        };
      }
      monthlyData[month].sessionsCount++;
      monthlyData[month].energyConsumed += session.energyDelivered || 0;
      monthlyData[month].totalCost += session.cost || 0;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
      avgCostPerKwh: data.energyConsumed > 0 ? data.totalCost / data.energyConsumed : 0
    }));
  }

  async getBusinessMonthlyBreakdown(ownerId, period) {
    const stations = await Station.find({ ownerId });
    const stationIds = stations.map(station => station._id);
    
    const sessions = await ChargingSession.find({
      stationId: { $in: stationIds },
      startTime: this.getDateFilter(period)
    });

    const monthlyData = {};
    sessions.forEach(session => {
      const month = session.startTime.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          sessions: 0,
          revenue: 0
        };
      }
      monthlyData[month].sessions++;
      monthlyData[month].revenue += session.cost || 0;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    }));
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

  // Get business metrics for analytics dashboard
  async getBusinessMetrics(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get owner's stations
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get charging sessions for owner's stations
      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      }).populate('userId vehicleId stationId');

      // Calculate metrics
      const totalRevenue = sessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const totalSessions = sessions.length;
      const totalEnergy = sessions.reduce((sum, session) => sum + (session.energyDelivered || 0), 0);
      const averageSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length 
        : 0;

      // Calculate growth rate (compare with previous period)
      const previousPeriodFilter = this.getPreviousPeriodFilter(period);
      const previousSessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: previousPeriodFilter
      });
      const previousRevenue = previousSessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      // Get customer satisfaction (mock for now - would need reviews)
      const customerSatisfaction = 4.6; // This would come from reviews

      // Get top performing station
      const stationPerformance = {};
      sessions.forEach(session => {
        if (session.stationId && session.stationId.name) {
          if (!stationPerformance[session.stationId.name]) {
            stationPerformance[session.stationId.name] = { sessions: 0, revenue: 0 };
          }
          stationPerformance[session.stationId.name].sessions++;
          stationPerformance[session.stationId.name].revenue += session.cost || 0;
        }
      });

      const topPerformingStation = Object.entries(stationPerformance)
        .sort(([,a], [,b]) => b.revenue - a.revenue)[0]?.[0] || 'No data';

      return {
        totalRevenue,
        totalSessions,
        totalEnergy,
        averageSessionDuration: Math.round(averageSessionDuration),
        growthRate: Math.round(growthRate * 100) / 100,
        customerSatisfaction,
        topPerformingStation
      };
    } catch (error) {
      throw new Error(`Error calculating business metrics: ${error.message}`);
    }
  }

  // Get revenue trends
  async getRevenueTrends(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get owner's stations
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get charging sessions
      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      });

      // Group by period
      const monthlyData = {};
      sessions.forEach(session => {
        const month = session.startTime.toISOString().substring(0, 7);
        if (!monthlyData[month]) {
          monthlyData[month] = {
            month: month.substring(5), // Just MM format
            revenue: 0,
            sessions: 0,
            energy: 0
          };
        }
        monthlyData[month].revenue += session.cost || 0;
        monthlyData[month].sessions += 1;
        monthlyData[month].energy += session.energyDelivered || 0;
      });

      return {
        monthlyData: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
      };
    } catch (error) {
      throw new Error(`Error calculating revenue trends: ${error.message}`);
    }
  }

  // Get station performance
  async getStationPerformance(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get owner's stations
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get charging sessions
      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      }).populate('stationId');

      // Calculate performance for each station
      const stationPerformance = {};
      sessions.forEach(session => {
        if (session.stationId && session.stationId.name) {
          if (!stationPerformance[session.stationId.name]) {
            stationPerformance[session.stationId.name] = { 
              name: session.stationId.name,
              sessions: 0, 
              revenue: 0,
              utilization: 0
            };
          }
          stationPerformance[session.stationId.name].sessions++;
          stationPerformance[session.stationId.name].revenue += session.cost || 0;
        }
      });

      // Calculate utilization (sessions per day / total possible sessions)
      const daysInPeriod = this.getDaysInPeriod(period);
      Object.values(stationPerformance).forEach(station => {
        station.utilization = Math.round((station.sessions / daysInPeriod) * 10); // Rough utilization percentage
      });

      return {
        stations: Object.values(stationPerformance)
      };
    } catch (error) {
      throw new Error(`Error calculating station performance: ${error.message}`);
    }
  }

  // Get peak hours analysis
  async getPeakHoursAnalysis(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get owner's stations
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get charging sessions
      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      });

      // Group by hour
      const hourlyData = {};
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0') + ':00';
        hourlyData[hour] = { hour, sessions: 0 };
      }

      sessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        const hourKey = hour.toString().padStart(2, '0') + ':00';
        if (hourlyData[hourKey]) {
          hourlyData[hourKey].sessions++;
        }
      });

      return {
        hourlyData: Object.values(hourlyData)
      };
    } catch (error) {
      throw new Error(`Error calculating peak hours analysis: ${error.message}`);
    }
  }

  // Get customer insights
  async getCustomerInsights(ownerId, period = 'month') {
    try {
      const dateFilter = this.getDateFilter(period);
      
      // Get owner's stations
      const stations = await Station.find({ ownerId });
      const stationIds = stations.map(station => station._id);

      // Get charging sessions
      const sessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: dateFilter
      }).populate('userId');

      // Calculate customer insights
      const uniqueCustomers = new Set();
      const customerSessions = {};
      
      sessions.forEach(session => {
        if (session.userId && session.userId._id) {
          uniqueCustomers.add(session.userId._id.toString());
          const userId = session.userId._id.toString();
          if (!customerSessions[userId]) {
            customerSessions[userId] = 0;
          }
          customerSessions[userId]++;
        }
      });

      // Calculate repeat customers (customers with more than 1 session)
      const repeatCustomers = Object.values(customerSessions).filter(count => count > 1).length;
      const repeatCustomerRate = uniqueCustomers.size > 0 ? (repeatCustomers / uniqueCustomers.size) * 100 : 0;

      // Mock customer satisfaction (would come from reviews)
      const customerSatisfaction = 4.6;

      // Calculate growth rate
      const previousPeriodFilter = this.getPreviousPeriodFilter(period);
      const previousSessions = await ChargingSession.find({
        stationId: { $in: stationIds },
        startTime: previousPeriodFilter
      });
      const previousRevenue = previousSessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const currentRevenue = sessions.reduce((sum, session) => sum + (session.cost || 0), 0);
      const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      return {
        customerSatisfaction,
        repeatCustomers: Math.round(repeatCustomerRate),
        growthRate: Math.round(growthRate * 100) / 100
      };
    } catch (error) {
      throw new Error(`Error calculating customer insights: ${error.message}`);
    }
  }


  // Helper method to get previous period filter
  getPreviousPeriodFilter(period) {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    return { $gte: startDate, $lte: endDate };
  }

  // Helper method to get days in period
  getDaysInPeriod(period) {
    const now = new Date();
    
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      case 'year':
        return 365;
      default:
        return 30;
    }
  }
}

module.exports = new AnalyticsService();

