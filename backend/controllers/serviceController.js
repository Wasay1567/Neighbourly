const Service = require('../models/service');
const { AppError } = require('../utils/errors');
const cache = require('../utils/cache');

// Helper to invalidate service-related caches
const invalidateServiceCaches = async () => {
  await cache.invalidateByPattern('services:nearby:*');
  await cache.invalidateByPattern('services:search:*');
};

// Create new service
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create({
      ...req.body,
      providerId: req.user.id
    });
    
    // Invalidate caches
    await invalidateServiceCaches();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error) {
    next(error);
  }
};

// Get nearby services
exports.getNearbyServices = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, categoryId, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
    
    if (!lat || !lng) {
      throw new AppError('Latitude and longitude are required', 400);
    }
    
    const offset = (page - 1) * limit;
    
    // Create a stable cache key using rounded coordinates (approx 110m precision at 3 decimals)
    const cacheKey = `services:nearby:${parseFloat(lat).toFixed(3)}:${parseFloat(lng).toFixed(3)}:${parseFloat(radius)}:${categoryId || 'all'}:${minPrice || '0'}:${maxPrice || 'inf'}:${page}:${limit}`;
    
    // Try to get from cache
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        source: 'cache'
      });
    }
    
    const services = await Service.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      {
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        limit: parseInt(limit),
        offset
      }
    );
    
    const responseData = {
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: services.length // Note: This should ideally be a total count from DB, but keeping existing logic
        }
      }
    };
    
    // Cache for 1 hour (3600s) - safe due to active invalidation
    await cache.set(cacheKey, responseData, 3600);
    
    res.json({
      ...responseData,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
};

// Search services
exports.searchServices = async (req, res, next) => {
  try {
    const { q, categoryId, page = 1, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }
    
    const offset = (page - 1) * limit;
    const cacheKey = `services:search:${q}:${categoryId || 'all'}:${page}:${limit}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        source: 'cache'
      });
    }
    
    const services = await Service.search(q, {
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      limit: parseInt(limit),
      offset
    });
    
    const responseData = {
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: services.length
        }
      }
    };
    
    await cache.set(cacheKey, responseData, 3600); // Cache search for 1 hour
    
    res.json({
      ...responseData,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
};

// Get service by ID
exports.getService = async (req, res, next) => {
  try {
    const cacheKey = `services:detail:${req.params.id}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      // Still increment views even if served from cache
      Service.incrementViews(req.params.id).catch(() => {});
      return res.json({
        ...cached,
        source: 'cache'
      });
    }
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      throw new AppError('Service not found', 404);
    }
    
    // Increment view count (fire and forget)
    Service.incrementViews(service.id).catch(() => {});
    
    const responseData = {
      success: true,
      data: { service }
    };
    
    await cache.set(cacheKey, responseData, 3600); // Cache details for 1 hour
    
    res.json({
      ...responseData,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
};

// Get my services
exports.getMyServices = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const services = await Service.findByProvider(req.user.id, {
      status,
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: services.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update service
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.update(req.params.id, req.user.id, req.body);
    
    if (!service) {
      throw new AppError('Service not found or unauthorized', 404);
    }
    
    // Invalidate caches
    await invalidateServiceCaches();
    await cache.del(`services:detail:${req.params.id}`);
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });
  } catch (error) {
    next(error);
  }
};

// Delete service
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.delete(req.params.id, req.user.id);
    
    if (!service) {
      throw new AppError('Service not found or unauthorized', 404);
    }
    
    // Invalidate caches
    await invalidateServiceCaches();
    await cache.del(`services:detail:${req.params.id}`);
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};