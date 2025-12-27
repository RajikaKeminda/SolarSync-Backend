const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// GET /users - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// GET /users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// POST /users - Create new user
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.email || !userData.phone || !userData.firstName || !userData.lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, phone, firstName, lastName'
      });
    }

    const user = await userService.createUser(userData);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
});

// PUT /users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.updateUser(req.params.id, userData);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or phone already exists',
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// DELETE /users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// GET /users/type/:userType - Get users by type
router.get('/type/:userType', async (req, res) => {
  try {
    const { userType } = req.params;
    
    if (!['ev_owner', 'station_owner'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be ev_owner or station_owner'
      });
    }

    const users = await userService.getUsersByType(userType);
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users by type',
      error: error.message
    });
  }
});

// GET /users/verified/all - Get all verified users
router.get('/verified/all', async (req, res) => {
  try {
    const users = await userService.getVerifiedUsers();
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching verified users',
      error: error.message
    });
  }
});

// GET /users/email/:email - Get user by email
router.get('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userService.getUserByEmail(email);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user by email',
      error: error.message
    });
  }
});

// GET /users/phone/:phone - Get user by phone
router.get('/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const user = await userService.getUserByPhone(phone);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user by phone',
      error: error.message
    });
  }
});

module.exports = router;
