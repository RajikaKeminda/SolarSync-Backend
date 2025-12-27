const express = require('express');
const router = express.Router();
const stationService = require('../services/stationService');

// GET /stations - Get all stations
router.get('/', async (req, res) => {
  try {
    const stations = await stationService.getAllStations();
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations',
      error: error.message
    });
  }
});

// GET /stations/active - Get all active stations
router.get('/active', async (req, res) => {
  try {
    const stations = await stationService.getActiveStations();
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching active stations',
      error: error.message
    });
  }
});

// GET /stations/available - Get stations with available ports
router.get('/available', async (req, res) => {
  try {
    const stations = await stationService.getStationsWithAvailablePorts();
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations with available ports',
      error: error.message
    });
  }
});

// GET /stations/top-rated - Get top rated stations
router.get('/top-rated', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const stations = await stationService.getTopRatedStations(limit);
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top rated stations',
      error: error.message
    });
  }
});

// GET /stations/search - Search stations by name, description, or address
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required'
      });
    }
    
    const stations = await stationService.searchStations(q);
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching stations',
      error: error.message
    });
  }
});

// GET /stations/location - Get stations by location
router.get('/location', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude parameters are required'
      });
    }
    
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = radius ? parseFloat(radius) : 10;
    
    if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude, longitude, or radius values'
      });
    }
    
    const stations = await stationService.getStationsByLocation(lat, lng, radiusKm);
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations by location',
      error: error.message
    });
  }
});

// GET /stations/amenities - Get stations by amenities
router.get('/amenities', async (req, res) => {
  try {
    const { amenities } = req.query;
    
    if (!amenities) {
      return res.status(400).json({
        success: false,
        message: 'Amenities parameter is required'
      });
    }
    
    const amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(',');
    const stations = await stationService.getStationsByAmenities(amenitiesArray);
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations by amenities',
      error: error.message
    });
  }
});

// GET /stations/port-type/:type - Get stations by port type
router.get('/port-type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const stations = await stationService.getStationsByPortType(type);
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations by port type',
      error: error.message
    });
  }
});

// GET /stations/owner/:ownerId - Get stations by owner ID
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const stations = await stationService.getStationsByOwnerId(ownerId);
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stations by owner',
      error: error.message
    });
  }
});

// GET /stations/:id - Get station by ID
router.get('/:id', async (req, res) => {
  try {
    const station = await stationService.getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    res.json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station',
      error: error.message
    });
  }
});

// POST /stations - Create new station
router.post('/', async (req, res) => {
  try {
    const stationData = req.body;
    
    // Validate required fields
    const requiredFields = ['ownerId', 'name', 'address', 'latitude', 'longitude', 'portTypes', 'pricing', 'operatingHours'];
    const missingFields = requiredFields.filter(field => !stationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Calculate totalPorts and availablePorts from portTypes
    if (stationData.portTypes && Array.isArray(stationData.portTypes)) {
      stationData.totalPorts = stationData.portTypes.reduce((sum, port) => sum + port.count, 0);
      stationData.availablePorts = stationData.portTypes.reduce((sum, port) => sum + port.available, 0);
    }

    const station = await stationService.createStation(stationData);
    res.status(201).json({
      success: true,
      data: station,
      message: 'Station created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating station',
      error: error.message
    });
  }
});

// PUT /stations/:id - Update station
router.put('/:id', async (req, res) => {
  try {
    const stationData = req.body;
    
    // Recalculate totalPorts and availablePorts if portTypes are updated
    if (stationData.portTypes && Array.isArray(stationData.portTypes)) {
      stationData.totalPorts = stationData.portTypes.reduce((sum, port) => sum + port.count, 0);
      stationData.availablePorts = stationData.portTypes.reduce((sum, port) => sum + port.available, 0);
    }
    
    const station = await stationService.updateStation(req.params.id, stationData);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      data: station,
      message: 'Station updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating station',
      error: error.message
    });
  }
});

// PATCH /stations/:id/availability - Update station port availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const { portType, change } = req.body;
    
    if (!portType || change === undefined) {
      return res.status(400).json({
        success: false,
        message: 'portType and change parameters are required'
      });
    }
    
    const station = await stationService.updateStationAvailability(req.params.id, portType, change);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      data: station,
      message: 'Station availability updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating station availability',
      error: error.message
    });
  }
});

// PATCH /stations/:id/rating - Update station rating
router.patch('/:id/rating', async (req, res) => {
  try {
    const { rating } = req.body;
    
    if (rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid rating (0-5) is required'
      });
    }
    
    const station = await stationService.updateStationRating(req.params.id, rating);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      data: station,
      message: 'Station rating updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating station rating',
      error: error.message
    });
  }
});

// PATCH /stations/:id/deactivate - Deactivate station
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const station = await stationService.deactivateStation(req.params.id);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      data: station,
      message: 'Station deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating station',
      error: error.message
    });
  }
});

// PATCH /stations/:id/activate - Activate station
router.patch('/:id/activate', async (req, res) => {
  try {
    const station = await stationService.activateStation(req.params.id);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      data: station,
      message: 'Station activated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error activating station',
      error: error.message
    });
  }
});

// DELETE /stations/:id - Delete station
router.delete('/:id', async (req, res) => {
  try {
    const station = await stationService.deleteStation(req.params.id);
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }

    res.json({
      success: true,
      message: 'Station deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting station',
      error: error.message
    });
  }
});

module.exports = router;
