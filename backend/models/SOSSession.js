const mongoose = require('mongoose');

const sosSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Session must belong to a user']
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired'],
    default: 'active'
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  locationHistory: [
    {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours expiry
  }
}, {
  timestamps: true
});

// Index for automatic deletion after expiry
sosSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SOSSession = mongoose.model('SOSSession', sosSessionSchema);
module.exports = SOSSession;
