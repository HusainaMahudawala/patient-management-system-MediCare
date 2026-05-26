const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const User = require('../models/User');

function getUserScopedFilter(userId) {
  return { patientId: userId };
}

exports.getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const userFilter = getUserScopedFilter(req.user.id);

    const [user, totalAppointments, upcomingVisits, medicalReports, pendingReports, notifications] = await Promise.all([
      User.findById(req.user.id).select('name email'),
      Appointment.countDocuments(userFilter),
      Appointment.countDocuments({
        ...userFilter,
        appointmentDate: { $gte: startOfToday },
        status: { $in: ['Pending', 'Confirmed'] },
      }),
      Report.countDocuments(userFilter),
      Report.countDocuments({
        ...userFilter,
        status: 'Pending',
      }),
      Notification.countDocuments({
        $and: [
          userFilter,
          {
            $or: [{ isRead: false }, { read: false }, { isRead: { $exists: false }, read: { $exists: false } }],
          },
        ],
      }),
    ]);

    return res.json({
      patient: user ? { id: user._id, name: user.name, email: user.email } : null,
      totalAppointments,
      upcomingVisits,
      medicalReports,
      pendingReports,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};