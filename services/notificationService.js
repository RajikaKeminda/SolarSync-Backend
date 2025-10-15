const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  // Get user notifications
  async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      return notifications;
    } catch (error) {
      throw new Error(`Error fetching user notifications: ${error.message}`);
    }
  }

  // Get unread notifications count
  async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        isRead: false
      });
      return count;
    } catch (error) {
      throw new Error(`Error fetching unread count: ${error.message}`);
    }
  }

  // Create notification
  async createNotification(notificationData) {
    try {
      const notification = new Notification({
        userId: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        data: notificationData.data || {},
        isRead: false
      });

      await notification.save();
      return notification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        throw new Error('Notification not found');
      }

      return notification;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return result;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      const result = await Notification.findByIdAndDelete(notificationId);
      
      if (!result) {
        throw new Error('Notification not found');
      }

      return result;
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  // Send bulk notification
  async sendBulkNotification(notificationData) {
    try {
      const notifications = notificationData.userIds.map(userId => ({
        userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        data: notificationData.data || {},
        isRead: false
      }));

      const result = await Notification.insertMany(notifications);
      return result;
    } catch (error) {
      throw new Error(`Error sending bulk notifications: ${error.message}`);
    }
  }

  // Get notification settings
  async getNotificationSettings(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }

      // Default settings if not set
      const defaultSettings = {
        chargingReminders: true,
        reservationUpdates: true,
        promotionalOffers: true,
        systemUpdates: true,
        emailNotifications: true,
        pushNotifications: true
      };

      return user.notificationSettings || defaultSettings;
    } catch (error) {
      throw new Error(`Error fetching notification settings: ${error.message}`);
    }
  }

  // Update notification settings
  async updateNotificationSettings(userId, settings) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { notificationSettings: settings },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.notificationSettings;
    } catch (error) {
      throw new Error(`Error updating notification settings: ${error.message}`);
    }
  }

  // Auto-create notifications for charging events
  async createChargingNotifications(sessionData) {
    try {
      const notifications = [];

      // Session started notification
      if (sessionData.status === 'active') {
        notifications.push({
          userId: sessionData.userId,
          title: 'Charging Started',
          message: `Your charging session has started at ${sessionData.stationName || 'the station'}`,
          type: 'success',
          data: { sessionId: sessionData._id, type: 'charging_started' }
        });
      }

      // Session completed notification
      if (sessionData.status === 'completed') {
        notifications.push({
          userId: sessionData.userId,
          title: 'Charging Completed',
          message: `Your charging session is complete. Energy delivered: ${sessionData.energyDelivered || 0} kWh`,
          type: 'info',
          data: { sessionId: sessionData._id, type: 'charging_completed' }
        });
      }

      // Payment due notification
      if (sessionData.status === 'completed' && sessionData.paymentStatus === 'pending') {
        notifications.push({
          userId: sessionData.userId,
          title: 'Payment Due',
          message: `Please complete payment for your charging session. Amount: $${sessionData.cost || 0}`,
          type: 'warning',
          data: { sessionId: sessionData._id, type: 'payment_due' }
        });
      }

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating charging notifications:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Auto-create notifications for reservation events
  async createReservationNotifications(reservationData) {
    try {
      const notifications = [];

      // Reservation confirmed
      if (reservationData.status === 'confirmed') {
        notifications.push({
          userId: reservationData.userId,
          title: 'Reservation Confirmed',
          message: `Your reservation for ${reservationData.stationName || 'the station'} is confirmed`,
          type: 'success',
          data: { reservationId: reservationData._id, type: 'reservation_confirmed' }
        });
      }

      // Reservation cancelled
      if (reservationData.status === 'cancelled') {
        notifications.push({
          userId: reservationData.userId,
          title: 'Reservation Cancelled',
          message: `Your reservation for ${reservationData.stationName || 'the station'} has been cancelled`,
          type: 'warning',
          data: { reservationId: reservationData._id, type: 'reservation_cancelled' }
        });
      }

      // Reminder notification (30 minutes before)
      if (reservationData.status === 'confirmed') {
        const scheduledTime = new Date(reservationData.scheduledStartTime);
        const reminderTime = new Date(scheduledTime.getTime() - 30 * 60 * 1000);
        
        if (reminderTime > new Date()) {
          notifications.push({
            userId: reservationData.userId,
            title: 'Reservation Reminder',
            message: `Your reservation starts in 30 minutes at ${reservationData.stationName || 'the station'}`,
            type: 'info',
            data: { reservationId: reservationData._id, type: 'reservation_reminder' },
            scheduledFor: reminderTime
          });
        }
      }

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating reservation notifications:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });

      return result;
    } catch (error) {
      throw new Error(`Error cleaning up old notifications: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();

