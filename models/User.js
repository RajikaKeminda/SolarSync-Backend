const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['ev_owner', 'station_owner'],
    default: 'ev_owner'
  },
  profileImage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt fields
});

// Add virtual for id field to match the TypeScript interface
userSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
