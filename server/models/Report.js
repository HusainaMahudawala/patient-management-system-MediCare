const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient ID is required'],
    index: true,
  },
  reportTitle: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
  },
  reportType: {
    type: String,
    required: [true, 'Report type is required'],
    trim: true,
  },
  doctorName: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
  },
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
  },
  reportDate: {
    type: Date,
    required: [true, 'Report date is required'],
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  reportFile: {
    type: String,
    required: [true, 'Report file path is required'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Archived'],
    default: 'Pending',
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);
