const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose');

// Create a new vehicle
const createVehicle = async (vehicleData) => {
  try {
    const vehicle = new Vehicle(vehicleData);
    const savedVehicle = await vehicle.save();
    return savedVehicle;
  } catch (error) {
    throw error;
  }
};

// Get all vehicles
const getAllVehicles = async () => {
  try {
    const vehicles = await Vehicle.find({}).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicle by ID
const getVehicleById = async (id) => {
  try {
    const vehicle = await Vehicle.findById(id).populate('ownerId', 'firstName lastName email');
    return vehicle;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by owner ID
const getVehiclesByOwnerId = async (ownerId) => {
  try {
    const vehicles = await Vehicle.find({ ownerId }).populate('ownerId', 'firstName lastName email').sort({ createdAt: -1 });
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get default vehicle for owner
const getDefaultVehicleByOwnerId = async (ownerId) => {
  try {
    const vehicle = await Vehicle.findOne({ ownerId, isDefault: true }).populate('ownerId', 'firstName lastName email');
    return vehicle;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by make
const getVehiclesByMake = async (make) => {
  try {
    const vehicles = await Vehicle.find({ make: { $regex: make, $options: 'i' } }).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by model
const getVehiclesByModel = async (model) => {
  try {
    const vehicles = await Vehicle.find({ model: { $regex: model, $options: 'i' } }).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by year
const getVehiclesByYear = async (year) => {
  try {
    const vehicles = await Vehicle.find({ year }).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by year range
const getVehiclesByYearRange = async (startYear, endYear) => {
  try {
    const vehicles = await Vehicle.find({
      year: {
        $gte: startYear,
        $lte: endYear
      }
    }).populate('ownerId', 'firstName lastName email').sort({ year: -1 });
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by charging port type
const getVehiclesByChargingPortType = async (chargingPortType) => {
  try {
    const vehicles = await Vehicle.find({ chargingPortType: chargingPortType }).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by battery capacity range
const getVehiclesByBatteryCapacityRange = async (minCapacity, maxCapacity) => {
  try {
    const vehicles = await Vehicle.find({
      batteryCapacity: {
        $gte: minCapacity,
        $lte: maxCapacity
      }
    }).populate('ownerId', 'firstName lastName email').sort({ batteryCapacity: -1 });
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by estimated range range
const getVehiclesByEstimatedRangeRange = async (minRange, maxRange) => {
  try {
    const vehicles = await Vehicle.find({
      estimatedRange: {
        $gte: minRange,
        $lte: maxRange
      }
    }).populate('ownerId', 'firstName lastName email').sort({ estimatedRange: -1 });
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Get vehicles with low battery level
const getVehiclesWithLowBattery = async (threshold = 20) => {
  try {
    const vehicles = await Vehicle.find({
      currentBatteryLevel: { $lte: threshold }
    }).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Search vehicles by make and model
const searchVehicles = async (searchTerm) => {
  try {
    const vehicles = await Vehicle.find({
      $or: [
        { make: { $regex: searchTerm, $options: 'i' } },
        { model: { $regex: searchTerm, $options: 'i' } }
      ]
    }).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

// Update vehicle by ID
const updateVehicle = async (id, updateData) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerId', 'firstName lastName email');
    return vehicle;
  } catch (error) {
    throw error;
  }
};

// Update vehicle battery level
const updateVehicleBatteryLevel = async (id, batteryLevel) => {
  try {
    if (batteryLevel < 0 || batteryLevel > 100) {
      throw new Error('Battery level must be between 0 and 100');
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { currentBatteryLevel: batteryLevel },
      { new: true, runValidators: true }
    ).populate('ownerId', 'firstName lastName email');
    return vehicle;
  } catch (error) {
    throw error;
  }
};

// Set vehicle as default
const setVehicleAsDefault = async (id) => {
  try {
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Unset other default vehicles for this owner
    await Vehicle.updateMany(
      { ownerId: vehicle.ownerId, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this vehicle as default
    vehicle.isDefault = true;
    const updatedVehicle = await vehicle.save();
    return updatedVehicle;
  } catch (error) {
    throw error;
  }
};

// Remove default status from vehicle
const removeDefaultStatus = async (id) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      id,
      { isDefault: false },
      { new: true, runValidators: true }
    ).populate('ownerId', 'firstName lastName email');
    return vehicle;
  } catch (error) {
    throw error;
  }
};

// Delete vehicle by ID
const deleteVehicle = async (id) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(id);
    return vehicle;
  } catch (error) {
    throw error;
  }
};

// Get vehicle statistics for owner
const getOwnerVehicleStats = async (ownerId) => {
  try {
    const stats = await Vehicle.aggregate([
      { $match: { ownerId: mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          averageBatteryCapacity: { $avg: '$batteryCapacity' },
          averageEstimatedRange: { $avg: '$estimatedRange' },
          averageBatteryLevel: { $avg: '$currentBatteryLevel' },
          vehiclesWithLowBattery: {
            $sum: { $cond: [{ $lte: ['$currentBatteryLevel', 20] }, 1, 0] }
          },
          defaultVehicle: {
            $sum: { $cond: ['$isDefault', 1, 0] }
          }
        }
      }
    ]);
    
    return stats[0] || {
      totalVehicles: 0,
      averageBatteryCapacity: 0,
      averageEstimatedRange: 0,
      averageBatteryLevel: 0,
      vehiclesWithLowBattery: 0,
      defaultVehicle: 0
    };
  } catch (error) {
    throw error;
  }
};

// Get vehicle statistics globally
const getGlobalVehicleStats = async () => {
  try {
    const stats = await Vehicle.aggregate([
      {
        $group: {
          _id: null,
          totalVehicles: { $sum: 1 },
          averageBatteryCapacity: { $avg: '$batteryCapacity' },
          averageEstimatedRange: { $avg: '$estimatedRange' },
          averageBatteryLevel: { $avg: '$currentBatteryLevel' },
          vehiclesWithLowBattery: {
            $sum: { $cond: [{ $lte: ['$currentBatteryLevel', 20] }, 1, 0] }
          },
          mostPopularMake: { $first: '$make' },
          mostPopularModel: { $first: '$model' },
          averageYear: { $avg: '$year' }
        }
      }
    ]);
    
    // Get most popular make and model separately
    const makeStats = await Vehicle.aggregate([
      { $group: { _id: '$make', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    const modelStats = await Vehicle.aggregate([
      { $group: { _id: '$model', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    const result = stats[0] || {
      totalVehicles: 0,
      averageBatteryCapacity: 0,
      averageEstimatedRange: 0,
      averageBatteryLevel: 0,
      vehiclesWithLowBattery: 0,
      mostPopularMake: null,
      mostPopularModel: null,
      averageYear: 0
    };
    
    if (makeStats.length > 0) {
      result.mostPopularMake = makeStats[0]._id;
    }
    
    if (modelStats.length > 0) {
      result.mostPopularModel = modelStats[0]._id;
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Get vehicles by multiple criteria
const getVehiclesByCriteria = async (criteria) => {
  try {
    const query = {};
    
    if (criteria.make) {
      query.make = { $regex: criteria.make, $options: 'i' };
    }
    
    if (criteria.model) {
      query.model = { $regex: criteria.model, $options: 'i' };
    }
    
    if (criteria.year) {
      query.year = criteria.year;
    }
    
    if (criteria.minYear || criteria.maxYear) {
      query.year = {};
      if (criteria.minYear) query.year.$gte = criteria.minYear;
      if (criteria.maxYear) query.year.$lte = criteria.maxYear;
    }
    
    if (criteria.chargingPortType) {
      query.chargingPortType = criteria.chargingPortType;
    }
    
    if (criteria.minBatteryCapacity || criteria.maxBatteryCapacity) {
      query.batteryCapacity = {};
      if (criteria.minBatteryCapacity) query.batteryCapacity.$gte = criteria.minBatteryCapacity;
      if (criteria.maxBatteryCapacity) query.batteryCapacity.$lte = criteria.maxBatteryCapacity;
    }
    
    if (criteria.minEstimatedRange || criteria.maxEstimatedRange) {
      query.estimatedRange = {};
      if (criteria.minEstimatedRange) query.estimatedRange.$gte = criteria.minEstimatedRange;
      if (criteria.maxEstimatedRange) query.estimatedRange.$lte = criteria.maxEstimatedRange;
    }
    
    if (criteria.maxBatteryLevel !== undefined) {
      query.currentBatteryLevel = { $lte: criteria.maxBatteryLevel };
    }
    
    const vehicles = await Vehicle.find(query).populate('ownerId', 'firstName lastName email');
    return vehicles;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  getVehiclesByOwnerId,
  getDefaultVehicleByOwnerId,
  getVehiclesByMake,
  getVehiclesByModel,
  getVehiclesByYear,
  getVehiclesByYearRange,
  getVehiclesByChargingPortType,
  getVehiclesByBatteryCapacityRange,
  getVehiclesByEstimatedRangeRange,
  getVehiclesWithLowBattery,
  searchVehicles,
  updateVehicle,
  updateVehicleBatteryLevel,
  setVehicleAsDefault,
  removeDefaultStatus,
  deleteVehicle,
  getOwnerVehicleStats,
  getGlobalVehicleStats,
  getVehiclesByCriteria
};
