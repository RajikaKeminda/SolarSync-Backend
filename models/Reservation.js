const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  scheduledStartTime: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1,
    max: 1440 // Maximum 24 hours in minutes
  },
  status: {
    type: String,
    required: true,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add virtual for id field to match the TypeScript interface
reservationSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
reservationSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
reservationSchema.index({ userId: 1 });
reservationSchema.index({ stationId: 1 });
reservationSchema.index({ vehicleId: 1 });
reservationSchema.index({ scheduledStartTime: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ createdAt: 1 });

// Compound indexes for common queries
reservationSchema.index({ userId: 1, status: 1 });
reservationSchema.index({ stationId: 1, status: 1 });
reservationSchema.index({ stationId: 1, scheduledStartTime: 1 });

// Pre-save middleware to validate scheduled start time
reservationSchema.pre('save', function(next) {
  // if (this.scheduledStartTime < new Date()) {
  //   return next(new Error('Scheduled start time cannot be in the past'));
  // }
  next();
});

// Virtual field to calculate estimated end time
reservationSchema.virtual('estimatedEndTime').get(function() {
  return new Date(this.scheduledStartTime.getTime() + (this.estimatedDuration * 60000));
});

// Virtual field to check if reservation is active
reservationSchema.virtual('isActive').get(function() {
  return this.status === 'confirmed' && this.scheduledStartTime > new Date();
});

// Virtual field to check if reservation is upcoming
reservationSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const endTime = new Date(this.scheduledStartTime.getTime() + (this.estimatedDuration * 60000));
  return this.status === 'confirmed' && this.scheduledStartTime > now && endTime > now;
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
