const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('emergencyContacts');
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getEmergencyContacts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('emergencyContacts');
    res.status(200).json({
      status: 'success',
      results: user.emergencyContacts.length,
      data: { contacts: user.emergencyContacts }
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates.'
      });
    }

    // 2) Filter out unwanted fields
    const filteredBody = filterObj(req.body, 'name', 'phone', 'address');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.addEmergencyContact = async (req, res, next) => {
  try {
    // 1) Create contact
    const newContact = await EmergencyContact.create({
      user: req.user.id,
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      relation: req.body.relation,
      priority: req.body.priority
    });

    // 2) Add to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { emergencyContacts: newContact._id }
    });

    res.status(201).json({
      status: 'success',
      data: { contact: newContact }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteEmergencyContact = async (req, res, next) => {
    try {
      await EmergencyContact.findByIdAndDelete(req.params.id);
      
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { emergencyContacts: req.params.id }
      });
  
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err.message
      });
    }
};

exports.updateEmergencyContact = async (req, res, next) => {
  try {
    const updatedContact = await EmergencyContact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({
        status: 'fail',
        message: 'No contact found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { contact: updatedContact }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
