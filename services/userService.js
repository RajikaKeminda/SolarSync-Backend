const User = require('../models/User');

// Create a new user
const createUser = async (userData) => {
  try {
    const user = new User(userData);
    const savedUser = await user.save();
    return savedUser;
  } catch (error) {
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const users = await User.find({});
    return users;
  } catch (error) {
    throw error;
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw error;
  }
};

// Get user by email
const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    throw error;
  }
};

// Get user by phone
const getUserByPhone = async (phone) => {
  try {
    const user = await User.findOne({ phone });
    return user;
  } catch (error) {
    throw error;
  }
};

// Update user by ID
const updateUser = async (id, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    return user;
  } catch (error) {
    throw error;
  }
};

// Delete user by ID
const deleteUser = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id);
    return user;
  } catch (error) {
    throw error;
  }
};

// Get users by type
const getUsersByType = async (userType) => {
  try {
    const users = await User.find({ userType });
    return users;
  } catch (error) {
    throw error;
  }
};

// Get verified users
const getVerifiedUsers = async () => {
  try {
    const users = await User.find({ isVerified: true });
    return users;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  updateUser,
  deleteUser,
  getUsersByType,
  getVerifiedUsers
};
