const Notification = require('../models/Notification');

function getUserScopedFilter(userId) {
  return {
    $or: [{ patientId: userId }, { user: userId }],
  };
}

function formatNotification(notification) {
  return {
    id: notification._id,
    patientId: notification.patientId || notification.user,
    title: notification.title,
    message: notification.message,
    isRead: typeof notification.isRead === 'boolean' ? notification.isRead : Boolean(notification.read),
    createdAt: notification.createdAt,
  };
}

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find(getUserScopedFilter(req.user.id))
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ notifications: notifications.map(formatNotification) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      $and: [
        getUserScopedFilter(req.user.id),
        {
          $or: [{ isRead: false }, { read: false }, { isRead: { $exists: false }, read: { $exists: false } }],
        },
      ],
    });
    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};