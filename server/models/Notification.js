const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Legacy owner key used by existing records.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Legacy read key used by existing records.
    read: {
      type: Boolean,
      default: false,
    },
    // Legacy UI tone key used by existing records.
    tone: {
      type: String,
      enum: ['info', 'success', 'warning', 'danger'],
      default: 'info',
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
