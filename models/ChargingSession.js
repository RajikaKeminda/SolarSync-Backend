const mongoose = require('mongoose');

const chargingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  energyDelivered: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Reasonable upper limit for energy delivered in kWh
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'active'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    default: null
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add virtual for id field to match the TypeScript interface
chargingSessionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
chargingSessionSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
chargingSessionSchema.index({ userId: 1 });
chargingSessionSchema.index({ vehicleId: 1 });
chargingSessionSchema.index({ stationId: 1 });
chargingSessionSchema.index({ startTime: 1 });
chargingSessionSchema.index({ status: 1 });
chargingSessionSchema.index({ paymentStatus: 1 });
chargingSessionSchema.index({ reservationId: 1 });
chargingSessionSchema.index({ createdAt: 1 });

// Compound indexes for common queries
chargingSessionSchema.index({ userId: 1, status: 1 });
chargingSessionSchema.index({ stationId: 1, status: 1 });
chargingSessionSchema.index({ stationId: 1, startTime: 1 });
chargingSessionSchema.index({ userId: 1, paymentStatus: 1 });

// Virtual field to calculate session duration
chargingSessionSchema.virtual('duration').get(function() {
  if (!this.endTime) {
    return null;
  }
  return Math.round((this.endTime - this.startTime) / (1000 * 60)); // Duration in minutes
});

// Virtual field to check if session is active
chargingSessionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && !this.endTime;
});

// Virtual field to check if session is completed
chargingSessionSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed' && this.endTime;
});

// Virtual field to calculate cost per kWh
chargingSessionSchema.virtual('costPerKwh').get(function() {
  if (this.energyDelivered === 0) {
    return 0;
  }
  return this.cost / this.energyDelivered;
});

// Pre-save middleware to validate end time
chargingSessionSchema.pre('save', function(next) {
  if (this.endTime && this.endTime < this.startTime) {
    return next(new Error('End time cannot be before start time'));
  }
  next();
});

// Pre-save middleware to auto-set status based on end time
chargingSessionSchema.pre('save', function(next) {
  if (this.endTime && this.status === 'active') {
    this.status = 'completed';
  }
  next();
});

const ChargingSession = mongoose.model('ChargingSession', chargingSessionSchema);

module.exports = ChargingSession;
