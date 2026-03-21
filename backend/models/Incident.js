const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this incident'],
    trim: true,
    maxlength: [120, 'Title cannot be more than 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Please describe the incident'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please select an incident type'],
    enum: ['harassment', 'assault', 'theft', 'stalking', 'unsafe_area', 'poor_lighting', 'suspicious_activity', 'other'],
    default: 'other'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true,
      default: ''
    }
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'under_review'],
    default: 'active'
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for geospatial queries (simple lat/lng based)
incidentSchema.index({ 'location.lat': 1, 'location.lng': 1 });
incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);
module.exports = Incident;
