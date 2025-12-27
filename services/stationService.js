const Station = require('../models/Station');

// Create a new station
const createStation = async (stationData) => {
  try {
    const station = new Station(stationData);
    const savedStation = await station.save();
    return savedStation;
  } catch (error) {
    throw error;
  }
};

// Get all stations
const getAllStations = async () => {
  try {
    const stations = await Station.find({}).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get station by ID
const getStationById = async (id) => {
  try {
    const station = await Station.findById(id).populate('ownerId', 'firstName lastName email');
    return station;
  } catch (error) {
    throw error;
  }
};

// Get stations by owner ID
const getStationsByOwnerId = async (ownerId) => {
  try {
    const stations = await Station.find({ ownerId }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get active stations
const getActiveStations = async () => {
  try {
    const stations = await Station.find({ isActive: true }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get stations by location (within radius)
const getStationsByLocation = async (latitude, longitude, radiusKm = 10) => {
  try {
    const stations = await Station.find({
      isActive: true,
      latitude: {
        $gte: latitude - (radiusKm / 111), // Rough conversion: 1 degree ≈ 111 km
        $lte: latitude + (radiusKm / 111)
      },
      longitude: {
        $gte: longitude - (radiusKm / 111),
        $lte: longitude + (radiusKm / 111)
      }
    }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get stations by amenities
const getStationsByAmenities = async (amenities) => {
  try {
    const stations = await Station.find({
      isActive: true,
      amenities: { $in: amenities }
    }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get stations by port type
const getStationsByPortType = async (portType) => {
  try {
    const stations = await Station.find({
      isActive: true,
      'portTypes.type': portType,
      'portTypes.available': { $gt: 0 }
    }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Update station by ID
const updateStation = async (id, updateData) => {
  try {
    const station = await Station.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerId', 'firstName lastName email');
    return station;
  } catch (error) {
    throw error;
  }
};

// Update station availability (when ports are used/freed)
const updateStationAvailability = async (id, portType, change) => {
  try {
    const station = await Station.findById(id);
    if (!station) {
      throw new Error('Station not found');
    }

    const portTypeIndex = station.portTypes.findIndex(port => port.type === portType);
    if (portTypeIndex === -1) {
      throw new Error('Port type not found');
    }

    const portTypeObj = station.portTypes[portTypeIndex];
    const newAvailable = portTypeObj.available + change;
    
    if (newAvailable < 0 || newAvailable > portTypeObj.count) {
      throw new Error('Invalid availability change');
    }

    station.portTypes[portTypeIndex].available = newAvailable;
    station.availablePorts = station.portTypes.reduce((sum, port) => sum + port.available, 0);
    
    const updatedStation = await station.save();
    return updatedStation;
  } catch (error) {
    throw error;
  }
};

// Update station rating
const updateStationRating = async (id, newRating) => {
  try {
    const station = await Station.findById(id);
    if (!station) {
      throw new Error('Station not found');
    }

    const totalRating = station.averageRating * station.totalReviews;
    station.totalReviews += 1;
    station.averageRating = (totalRating + newRating) / station.totalReviews;
    
    const updatedStation = await station.save();
    return updatedStation;
  } catch (error) {
    throw error;
  }
};

// Delete station by ID
const deleteStation = async (id) => {
  try {
    const station = await Station.findByIdAndDelete(id);
    return station;
  } catch (error) {
    throw error;
  }
};

// Soft delete station (set isActive to false)
const deactivateStation = async (id) => {
  try {
    const station = await Station.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    ).populate('ownerId', 'firstName lastName email');
    return station;
  } catch (error) {
    throw error;
  }
};

// Reactivate station (set isActive to true)
const activateStation = async (id) => {
  try {
    const station = await Station.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true, runValidators: true }
    ).populate('ownerId', 'firstName lastName email');
    return station;
  } catch (error) {
    throw error;
  }
};

// Search stations by name or description
const searchStations = async (searchTerm) => {
  try {
    const stations = await Station.find({
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { address: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get stations with available ports
const getStationsWithAvailablePorts = async () => {
  try {
    const stations = await Station.find({
      isActive: true,
      availablePorts: { $gt: 0 }
    }).populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

// Get top rated stations
const getTopRatedStations = async (limit = 10) => {
  try {
    const stations = await Station.find({
      isActive: true,
      totalReviews: { $gte: 1 }
    })
    .sort({ averageRating: -1, totalReviews: -1 })
    .limit(limit)
    .populate('ownerId', 'firstName lastName email');
    return stations;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createStation,
  getAllStations,
  getStationById,
  getStationsByOwnerId,
  getActiveStations,
  getStationsByLocation,
  getStationsByAmenities,
  getStationsByPortType,
  updateStation,
  updateStationAvailability,
  updateStationRating,
  deleteStation,
  deactivateStation,
  activateStation,
  searchStations,
  getStationsWithAvailablePorts,
  getTopRatedStations
};
