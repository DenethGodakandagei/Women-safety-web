const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Contact must belong to a user']
  },
  name: {
    type: String,
    required: [true, 'Please provide a contact name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
    match: [/^(?:(?:\+94|0094)?7[0-9]{8}|0[7][0-9]{8})$/, 'Please provide a valid Sri Lankan phone number (e.g. 0768250162 or +94768250162)']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please provide a valid email']
  },
  relation: {
    type: String,
    enum: ['family', 'friend', 'colleague', 'partner', 'other'],
    default: 'family'
  },
  priority: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
module.exports = EmergencyContact;
