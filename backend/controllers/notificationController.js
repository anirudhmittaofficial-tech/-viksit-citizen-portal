import {
  getNotificationsForUser,
  markNotificationRead as dbMarkNotificationRead,
  markAllNotificationsRead as dbMarkAllNotificationsRead,
  findById
} from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private (or Public with email filter)
export const getMyNotifications = async (req, res, next) => {
  try {
    let notifications = [];

    if (req.user) {
      notifications = await getNotificationsForUser({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      });
    } else if (req.query.email) {
      notifications = await getNotificationsForUser({
        email: req.query.email
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      count: notifications.length,
      notifications,
      data: { notifications, count: notifications.length }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        error: 'Resource not found'
      });
    }

    const updatedNotif = await dbMarkNotificationRead(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification: updatedNotif,
      data: { notification: updatedNotif }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    if (req.user) {
      await dbMarkAllNotificationsRead({
        userId: req.user.id,
        email: req.user.email,
        role: req.user.role
      });
    }

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { unread: false }
    });
  } catch (error) {
    next(error);
  }
};

