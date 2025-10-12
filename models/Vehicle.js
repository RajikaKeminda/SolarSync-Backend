const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  batteryCapacity: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Reasonable upper limit for battery capacity in kWh
  },
  chargingPortType: [{
    type: String,
    required: true,
    enum: ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla']
  }],
  estimatedRange: {
    type: Number,
    required: true,
    min: 0,
    max: 1000 // Reasonable upper limit for range in km
  },
  currentBatteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add virtual for id field to match the TypeScript interface
vehicleSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', {
  virtuals: true
});

// Index for efficient queries
vehicleSchema.index({ ownerId: 1 });
vehicleSchema.index({ make: 1 });
vehicleSchema.index({ model: 1 });
vehicleSchema.index({ year: 1 });
vehicleSchema.index({ isDefault: 1 });
vehicleSchema.index({ chargingPortType: 1 });

// Compound index for owner and default vehicle
vehicleSchema.index({ ownerId: 1, isDefault: 1 });

// Pre-save middleware to ensure only one default vehicle per owner
vehicleSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Find and unset other default vehicles for this owner
    await this.constructor.updateMany(
      { ownerId: this.ownerId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Pre-save middleware to set default vehicle if it's the only one for the owner
vehicleSchema.pre('save', async function(next) {
  if (this.isNew) {
    const ownerVehicleCount = await this.constructor.countDocuments({ ownerId: this.ownerId });
    if (ownerVehicleCount === 0) {
      this.isDefault = true;
    }
  }
  next();
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
