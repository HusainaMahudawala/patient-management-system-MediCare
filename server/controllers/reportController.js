const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Report = require('../models/Report');
const Notification = require('../models/Notification');

function getUserScopedFilter(userId) {
  return { patientId: userId };
}

function formatReport(report) {
  return {
    id: report._id,
    patientId: report.patientId,
    reportTitle: report.reportTitle,
    reportType: report.reportType,
    doctorName: report.doctorName,
    hospitalName: report.hospitalName,
    reportDate: report.reportDate,
    description: report.description,
    reportFile: report.reportFile,
    status: report.status,
    uploadedAt: report.uploadedAt,
  };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function removeFileIfExists(filePath) {
  if (!filePath) {
    return;
  }

  const normalizedPath = filePath.replace(/^\/+/, '').replace(/\//g, path.sep);
  const absoluteFilePath = path.join(__dirname, '..', normalizedPath);

  if (fs.existsSync(absoluteFilePath)) {
    fs.unlinkSync(absoluteFilePath);
  }
}

exports.uploadReport = async (req, res) => {
  try {
    const { reportTitle, reportType, doctorName, hospitalName, reportDate, description } = req.body;

    if (!reportTitle || !reportType || !doctorName || !hospitalName || !reportDate) {
      return res.status(400).json({ message: 'All required report fields must be provided' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Report file is required' });
    }

    const report = await Report.create({
      patientId: req.user.id,
      reportTitle,
      reportType,
      doctorName,
      hospitalName,
      reportDate,
      description: description || '',
      reportFile: `/uploads/reports/${req.file.filename}`,
      status: 'Pending',
    });

    await Notification.create({
      patientId: req.user.id,
      title: 'New report uploaded',
      message: `${reportTitle} has been added to your medical records.`,
      isRead: false,
    });

    return res.status(201).json({
      message: 'Report uploaded successfully',
      report: formatReport(report),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const { reportType, doctorName, dateFrom, dateTo, search } = req.query;

    const filter = getUserScopedFilter(req.user.id);

    if (reportType) {
      filter.reportType = { $regex: `^${reportType}$`, $options: 'i' };
    }

    if (doctorName) {
      filter.doctorName = { $regex: doctorName, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      filter.reportDate = {};
      if (dateFrom) {
        filter.reportDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.reportDate.$lte = endDate;
      }
    }

    if (search) {
      filter.$or = [
        { reportTitle: { $regex: search, $options: 'i' } },
        { hospitalName: { $regex: search, $options: 'i' } },
      ];
    }

    const reports = await Report.find(filter)
      .sort({ reportDate: -1, uploadedAt: -1 })
      .lean();

    return res.json({ reports: reports.map(formatReport) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findOne({
      _id: id,
      ...getUserScopedFilter(req.user.id),
    }).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.json({ report: formatReport(report) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findOneAndDelete({
      _id: id,
      ...getUserScopedFilter(req.user.id),
    }).lean();

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    removeFileIfExists(report.reportFile);

    return res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getReportCount = async (req, res) => {
  try {
    const [count, pendingCount, recentReports] = await Promise.all([
      Report.countDocuments(getUserScopedFilter(req.user.id)),
      Report.countDocuments({ ...getUserScopedFilter(req.user.id), status: 'Pending' }),
      Report.find(getUserScopedFilter(req.user.id)).sort({ uploadedAt: -1 }).limit(5).lean(),
    ]);

    return res.json({
      count,
      pendingCount,
      recentReports: recentReports.map(formatReport),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};