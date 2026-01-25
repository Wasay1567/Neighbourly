const Location = require('../models/location');
const h3Service = require('../services/h3Service');
const { AppError } = require('../utils/errors');

// Get all cities
exports.getCities = async (req, res, next) => {
  try {
    const cities = await Location.getCities();
    
    res.json({
      success: true,
      data: { cities }
    });
  } catch (error) {
    next(error);
  }
};

// Get city details
exports.getCity = async (req, res, next) => {
  try {
    const city = await Location.getCityById(req.params.id);
    
    if (!city) {
      throw new AppError('City not found', 404);
    }
    
    res.json({
      success: true,
      data: { city }
    });
  } catch (error) {
    next(error);
  }
};

// Get neighborhoods by city
exports.getNeighborhoods = async (req, res, next) => {
  try {
    const { cityId } = req.params;
    const neighborhoods = await Location.getNeighborhoodsByCity(cityId);
    
    res.json({
      success: true,
      data: { neighborhoods }
    });
  } catch (error) {
    next(error);
  }
};

// Get neighborhood details
exports.getNeighborhood = async (req, res, next) => {
  try {
    const neighborhood = await Location.getNeighborhoodById(req.params.id);
    
    if (!neighborhood) {
      throw new AppError('Neighborhood not found', 404);
    }
    
    res.json({
      success: true,
      data: { neighborhood }
    });
  } catch (error) {
    next(error);
  }
};

// Find neighborhood by coordinates
exports.findNeighborhood = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    
    const h3Index = h3Service.latLngToH3(parseFloat(lat), parseFloat(lng));
    const neighborhood = await Location.findNeighborhoodByCoordinates(h3Index);
    
    if (!neighborhood) {
      throw new AppError('No neighborhood found for these coordinates', 404);
    }
    
    res.json({
      success: true,
      data: { neighborhood, h3Index }
    });
  } catch (error) {
    next(error);
  }
};

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Location.getCategories();
    
    // Group by parent for easier frontend consumption
    const grouped = categories.reduce((acc, cat) => {
      if (cat.level === 0) {
        acc.push({
          ...cat,
          subcategories: categories.filter(c => c.parent_id === cat.id)
        });
      }
      return acc;
    }, []);
    
    res.json({
      success: true,
      data: { 
        categories: grouped,
        all: categories 
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get category details
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Location.getCategoryById(req.params.id);
    
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    
    // Get subcategories if this is a parent
    const subcategories = await Location.getSubcategories(req.params.id);
    
    res.json({
      success: true,
      data: { 
        category,
        subcategories 
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create city (admin only)
exports.createCity = async (req, res, next) => {
  try {
    const { name, stateProvince, country, countryCode, timezone } = req.body;
    
    const city = await Location.createCity({
      name, stateProvince, country, countryCode, timezone
    });
    
    res.status(201).json({
      success: true,
      message: 'City created successfully',
      data: { city }
    });
  } catch (error) {
    next(error);
  }
};

// Create neighborhood (admin only)
exports.createNeighborhood = async (req, res, next) => {
  try {
    const { cityId, name, description, coordinates, boundaryGeoJson } = req.body;
    
    // Generate H3 cells for the neighborhood boundary
    let h3Cells = [];
    if (coordinates && coordinates.length > 0) {
      // Use polygon to generate H3 coverage
      h3Cells = h3Service.polygonToCells(coordinates, 9);
    }
    
    const neighborhood = await Location.createNeighborhood({
      cityId, name, description, 
      h3Cells, 
      boundaryGeoJson
    });
    
    res.status(201).json({
      success: true,
      message: 'Neighborhood created successfully',
      data: { neighborhood }
    });
  } catch (error) {
    next(error);
  }
};

// Create category (admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const { parentId, name, description, iconUrl, sortOrder } = req.body;
    
    const category = await Location.createCategory({
      parentId, name, description, iconUrl, sortOrder
    });
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};