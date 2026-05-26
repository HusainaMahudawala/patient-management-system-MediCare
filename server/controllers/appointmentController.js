const mongoose = require('mongoose');

const Appointment = require('../models/Appointment');
const User = require('../models/User');

function getUserScopedFilter(userId) {
  return { patientId: userId };
}

function formatAppointment(appointment) {
  return {
    id: appointment._id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    doctorName: appointment.doctorName,
    department: appointment.department,
    appointmentDate: appointment.appointmentDate,
    appointmentTime: appointment.appointmentTime,
    purpose: appointment.purpose,
    status: appointment.status,
    createdAt: appointment.createdAt,
  };
}

function validateAppointmentId(appointmentId) {
  return mongoose.Types.ObjectId.isValid(appointmentId);
}

exports.bookAppointment = async (req, res) => {
  try {
    const { doctorName, department, appointmentDate, appointmentTime, purpose, status } = req.body;

    if (!doctorName || !department || !appointmentDate || !appointmentTime || !purpose) {
      return res.status(400).json({ message: 'All appointment fields are required' });
    }

    const patient = await User.findById(req.user.id).select('name').lean();

    const appointment = await Appointment.create({
      patientId: req.user.id,
      patientName: patient?.name || req.body.patientName || 'Patient',
      doctorName,
      department,
      appointmentDate,
      appointmentTime,
      purpose,
      status: status || 'Pending',
    });

    return res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: formatAppointment(appointment),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find(getUserScopedFilter(req.user.id))
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    return res.json({ appointments: appointments.map(formatAppointment) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateAppointmentId(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      ...getUserScopedFilter(req.user.id),
    }).lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.json({ appointment: formatAppointment(appointment) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateAppointmentId(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const allowedUpdates = ['doctorName', 'department', 'appointmentDate', 'appointmentTime', 'purpose', 'status'];
    const payload = {};

    allowedUpdates.forEach((field) => {
      if (typeof req.body[field] !== 'undefined') {
        payload[field] = req.body[field];
      }
    });

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: id,
        ...getUserScopedFilter(req.user.id),
      },
      payload,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.json({
      message: 'Appointment updated successfully',
      appointment: formatAppointment(appointment),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateAppointmentId(id)) {
      return res.status(400).json({ message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findOneAndDelete({
      _id: id,
      ...getUserScopedFilter(req.user.id),
    }).lean();

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    return res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUpcomingAppointments = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      ...getUserScopedFilter(req.user.id),
      appointmentDate: { $gte: startOfToday },
      status: { $in: ['Pending', 'Confirmed'] },
    })
      .sort({ appointmentDate: 1, createdAt: 1 })
      .lean();

    return res.json({ appointments: appointments.map(formatAppointment) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAppointmentCount = async (req, res) => {
  try {
    const count = await Appointment.countDocuments(getUserScopedFilter(req.user.id));
    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};