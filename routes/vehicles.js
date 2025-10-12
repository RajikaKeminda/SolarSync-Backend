const express = require('express');
const router = express.Router();
const vehicleService = require('../services/vehicleService');

// GET /vehicles - Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
});

// GET /vehicles/search - Search vehicles by make and model
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required'
      });
    }
    
    const vehicles = await vehicleService.searchVehicles(q);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching vehicles',
      error: error.message
    });
  }
});

// GET /vehicles/criteria - Get vehicles by multiple criteria
router.get('/criteria', async (req, res) => {
  try {
    const criteria = req.query;
    const vehicles = await vehicleService.getVehiclesByCriteria(criteria);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by criteria',
      error: error.message
    });
  }
});

// GET /vehicles/low-battery - Get vehicles with low battery
router.get('/low-battery', async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 20;
    const vehicles = await vehicleService.getVehiclesWithLowBattery(threshold);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles with low battery',
      error: error.message
    });
  }
});

// GET /vehicles/stats/global - Get global vehicle statistics
router.get('/stats/global', async (req, res) => {
  try {
    const stats = await vehicleService.getGlobalVehicleStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching global vehicle statistics',
      error: error.message
    });
  }
});

// GET /vehicles/make/:make - Get vehicles by make
router.get('/make/:make', async (req, res) => {
  try {
    const { make } = req.params;
    const vehicles = await vehicleService.getVehiclesByMake(make);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by make',
      error: error.message
    });
  }
});

// GET /vehicles/model/:model - Get vehicles by model
router.get('/model/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const vehicles = await vehicleService.getVehiclesByModel(model);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by model',
      error: error.message
    });
  }
});

// GET /vehicles/year/:year - Get vehicles by year
router.get('/year/:year', async (req, res) => {
  try {
    const { year } = req.params;
    const yearNum = parseInt(year);
    
    if (isNaN(yearNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year format'
      });
    }
    
    const vehicles = await vehicleService.getVehiclesByYear(yearNum);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by year',
      error: error.message
    });
  }
});

// GET /vehicles/year-range - Get vehicles by year range
router.get('/year-range', async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    
    if (!startYear || !endYear) {
      return res.status(400).json({
        success: false,
        message: 'Start year and end year parameters are required'
      });
    }
    
    const start = parseInt(startYear);
    const end = parseInt(endYear);
    
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year format'
      });
    }
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start year must be before end year'
      });
    }
    
    const vehicles = await vehicleService.getVehiclesByYearRange(start, end);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by year range',
      error: error.message
    });
  }
});

// GET /vehicles/charging-port/:type - Get vehicles by charging port type
router.get('/charging-port/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charging port type'
      });
    }
    
    const vehicles = await vehicleService.getVehiclesByChargingPortType(type);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by charging port type',
      error: error.message
    });
  }
});

// GET /vehicles/battery-capacity-range - Get vehicles by battery capacity range
router.get('/battery-capacity-range', async (req, res) => {
  try {
    const { minCapacity, maxCapacity } = req.query;
    
    if (!minCapacity || !maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Min capacity and max capacity parameters are required'
      });
    }
    
    const min = parseFloat(minCapacity);
    const max = parseFloat(maxCapacity);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid capacity format'
      });
    }
    
    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Min capacity must be less than max capacity'
      });
    }
    
    const vehicles = await vehicleService.getVehiclesByBatteryCapacityRange(min, max);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by battery capacity range',
      error: error.message
    });
  }
});

// GET /vehicles/estimated-range-range - Get vehicles by estimated range range
router.get('/estimated-range-range', async (req, res) => {
  try {
    const { minRange, maxRange } = req.query;
    
    if (!minRange || !maxRange) {
      return res.status(400).json({
        success: false,
        message: 'Min range and max range parameters are required'
      });
    }
    
    const min = parseFloat(minRange);
    const max = parseFloat(maxRange);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid range format'
      });
    }
    
    if (min > max) {
      return res.status(400).json({
        success: false,
        message: 'Min range must be less than max range'
      });
    }
    
    const vehicles = await vehicleService.getVehiclesByEstimatedRangeRange(min, max);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by estimated range range',
      error: error.message
    });
  }
});

// GET /vehicles/owner/:ownerId - Get vehicles by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const vehicles = await vehicleService.getVehiclesByOwnerId(ownerId);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles by owner',
      error: error.message
    });
  }
});

// GET /vehicles/owner/:ownerId/default - Get default vehicle for owner
router.get('/owner/:ownerId/default', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const vehicle = await vehicleService.getDefaultVehicleByOwnerId(ownerId);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'No default vehicle found for this owner'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching default vehicle',
      error: error.message
    });
  }
});

// GET /vehicles/owner/:ownerId/stats - Get vehicle statistics for owner
router.get('/owner/:ownerId/stats', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const stats = await vehicleService.getOwnerVehicleStats(ownerId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching owner vehicle statistics',
      error: error.message
    });
  }
});

// GET /vehicles/:id - Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
});

// POST /vehicles - Create new vehicle
router.post('/', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Validate required fields
    const requiredFields = ['ownerId', 'make', 'model', 'year', 'batteryCapacity', 'chargingPortType', 'estimatedRange'];
    const missingFields = requiredFields.filter(field => !vehicleData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate year
    if (vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year'
      });
    }

    // Validate battery capacity
    if (vehicleData.batteryCapacity < 0 || vehicleData.batteryCapacity > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Battery capacity must be between 0 and 1000 kWh'
      });
    }

    // Validate estimated range
    if (vehicleData.estimatedRange < 0 || vehicleData.estimatedRange > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Estimated range must be between 0 and 1000 km'
      });
    }

    // Validate charging port types
    const validPortTypes = ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla'];
    if (!Array.isArray(vehicleData.chargingPortType) || 
        !vehicleData.chargingPortType.every(type => validPortTypes.includes(type))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charging port type. Must be one of: ' + validPortTypes.join(', ')
      });
    }

    // Validate current battery level if provided
    if (vehicleData.currentBatteryLevel !== undefined && 
        (vehicleData.currentBatteryLevel < 0 || vehicleData.currentBatteryLevel > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Current battery level must be between 0 and 100'
      });
    }

    const vehicle = await vehicleService.createVehicle(vehicleData);
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
});

// PUT /vehicles/:id - Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Validate year if provided
    if (vehicleData.year && (vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 1)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year'
      });
    }

    // Validate battery capacity if provided
    if (vehicleData.batteryCapacity && (vehicleData.batteryCapacity < 0 || vehicleData.batteryCapacity > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Battery capacity must be between 0 and 1000 kWh'
      });
    }

    // Validate estimated range if provided
    if (vehicleData.estimatedRange && (vehicleData.estimatedRange < 0 || vehicleData.estimatedRange > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Estimated range must be between 0 and 1000 km'
      });
    }

    // Validate charging port types if provided
    if (vehicleData.chargingPortType) {
      const validPortTypes = ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla'];
      if (!Array.isArray(vehicleData.chargingPortType) || 
          !vehicleData.chargingPortType.every(type => validPortTypes.includes(type))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid charging port type. Must be one of: ' + validPortTypes.join(', ')
        });
      }
    }

    // Validate current battery level if provided
    if (vehicleData.currentBatteryLevel !== undefined && 
        (vehicleData.currentBatteryLevel < 0 || vehicleData.currentBatteryLevel > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Current battery level must be between 0 and 100'
      });
    }
    
    const vehicle = await vehicleService.updateVehicle(req.params.id, vehicleData);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
});

// PATCH /vehicles/:id/battery-level - Update vehicle battery level
router.patch('/:id/battery-level', async (req, res) => {
  try {
    const { batteryLevel } = req.body;
    
    if (batteryLevel === undefined || batteryLevel < 0 || batteryLevel > 100) {
      return res.status(400).json({
        success: false,
        message: 'Battery level must be between 0 and 100'
      });
    }
    
    const vehicle = await vehicleService.updateVehicleBatteryLevel(req.params.id, batteryLevel);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle battery level updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle battery level',
      error: error.message
    });
  }
});

// PATCH /vehicles/:id/set-default - Set vehicle as default
router.patch('/:id/set-default', async (req, res) => {
  try {
    const vehicle = await vehicleService.setVehicleAsDefault(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle set as default successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error setting vehicle as default',
      error: error.message
    });
  }
});

// PATCH /vehicles/:id/remove-default - Remove default status from vehicle
router.patch('/:id/remove-default', async (req, res) => {
  try {
    const vehicle = await vehicleService.removeDefaultStatus(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: vehicle,
      message: 'Default status removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing default status',
      error: error.message
    });
  }
});

// DELETE /vehicles/:id - Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicle = await vehicleService.deleteVehicle(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
});

module.exports = router;
