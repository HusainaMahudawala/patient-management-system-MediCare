const User = require('../models/User');

const PHONE_REGEX = /^\+?[0-9\-\s()]{7,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeOptionalString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildProfilePayload(user) {
  return {
    id: user._id,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    age: user.age ?? null,
    gender: user.gender || '',
    bloodGroup: user.bloodGroup || '',
    address: user.address || '',
    emergencyContact: user.emergencyContact || '',
    profileImage: user.profileImage || '',
  };
}

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      'name email phone age gender bloodGroup address emergencyContact profileImage'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ profile: buildProfilePayload(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const name = normalizeOptionalString(req.body.name);
    const email = normalizeOptionalString(req.body.email).toLowerCase();
    const phone = normalizeOptionalString(req.body.phone);
    const gender = normalizeOptionalString(req.body.gender);
    const bloodGroup = normalizeOptionalString(req.body.bloodGroup);
    const address = normalizeOptionalString(req.body.address);
    const emergencyContact = normalizeOptionalString(req.body.emergencyContact);
    const ageValue = req.body.age;

    if (!name) {
      return res.status(400).json({ message: 'Full name is required' });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: 'Enter a valid phone number' });
    }

    if (emergencyContact && !PHONE_REGEX.test(emergencyContact)) {
      return res.status(400).json({ message: 'Enter a valid emergency contact number' });
    }

    let age = null;
    if (ageValue !== undefined && ageValue !== null && String(ageValue).trim() !== '') {
      age = Number(ageValue);
      if (Number.isNaN(age) || age < 0 || age > 120) {
        return res.status(400).json({ message: 'Age must be between 0 and 120' });
      }
    }

    const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } }).select('_id').lean();
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const updatePayload = {
      name,
      email,
      phone,
      age,
      gender,
      bloodGroup,
      address,
      emergencyContact,
    };

    if (req.file) {
      updatePayload.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updatePayload, {
      new: true,
      runValidators: true,
    }).select('name email phone age gender bloodGroup address emergencyContact profileImage');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Profile updated successfully',
      profile: buildProfilePayload(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};