const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

// GET /notifications - Get user notifications
router.get('/', async (req, res) => {
  try {
    const { userId, limit = 20, offset = 0 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notifications = await notificationService.getUserNotifications(userId, limit, offset);
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// GET /notifications/unread - Get unread notifications count
router.get('/unread', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const count = await notificationService.getUnreadCount(userId);
    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
});

// POST /notifications - Create notification
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type, data } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, and message are required'
      });
    }

    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type: type || 'info',
      data: data || {}
    });

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

// PUT /notifications/:id/read - Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await notificationService.markAsRead(id);
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// PUT /notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await notificationService.markAllAsRead(userId);
    res.json({
      success: true,
      data: { updatedCount: result.modifiedCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
});

// DELETE /notifications/:id - Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await notificationService.deleteNotification(id);
    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
});

// POST /notifications/send - Send notification to multiple users
router.post('/send', async (req, res) => {
  try {
    const { userIds, title, message, type, data } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array, title, and message are required'
      });
    }

    const result = await notificationService.sendBulkNotification({
      userIds,
      title,
      message,
      type: type || 'info',
      data: data || {}
    });

    res.json({
      success: true,
      data: { sentCount: result.length }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending notifications',
      error: error.message
    });
  }
});

// GET /notifications/settings - Get notification settings
router.get('/settings', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const settings = await notificationService.getNotificationSettings(userId);
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification settings',
      error: error.message
    });
  }
});

// PUT /notifications/settings - Update notification settings
router.put('/settings', async (req, res) => {
  try {
    const { userId, settings } = req.body;
    
    if (!userId || !settings) {
      return res.status(400).json({
        success: false,
        message: 'User ID and settings are required'
      });
    }

    const updatedSettings = await notificationService.updateNotificationSettings(userId, settings);
    res.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification settings',
      error: error.message
    });
  }
});

module.exports = router;

