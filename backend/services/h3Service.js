const h3 = require('h3-js');
const logger = require('../utils/logger');

/**
 * H3 Geospatial Service
 * Handles all H3 hexagon-based geospatial operations for location-based search
 */
class H3Service {
  constructor() {
    // H3 resolution levels:
    // Resolution 7: ~5.16 km² (~2.5 km edge) - City-level
    // Resolution 8: ~0.74 km² (~0.9 km edge) - Neighborhood-level
    // Resolution 9: ~0.10 km² (~350 m edge) - Block-level (DEFAULT)
    // Resolution 10: ~0.015 km² (~120 m edge) - Precise location
    this.defaultResolution = parseInt(process.env.H3_DEFAULT_RESOLUTION || '9', 10);
    this.searchResolutions = process.env.H3_SEARCH_RESOLUTIONS?.split(',').map(Number) || [7, 8, 9];
  }

  /**
   * Convert latitude/longitude to H3 index
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} resolution - H3 resolution level
   * @returns {string} H3 index
   */
  latLngToH3(lat, lng, resolution = this.defaultResolution) {
    try {
      if (!this.isValidCoordinate(lat, lng)) {
        throw new Error('Invalid coordinates');
      }
      return h3.latLngToCell(lat, lng, resolution);
    } catch (error) {
      logger.error('Error converting lat/lng to H3', { lat, lng, resolution, error: error.message });
      throw error;
    }
  }

  /**
   * Convert H3 index to latitude/longitude
   * @param {string} h3Index - H3 index
   * @returns {Object} {lat, lng}
   */
  h3ToLatLng(h3Index) {
    try {
      const [lat, lng] = h3.cellToLatLng(h3Index);
      return { lat, lng };
    } catch (error) {
      logger.error('Error converting H3 to lat/lng', { h3Index, error: error.message });
      throw error;
    }
  }

  /**
   * Get neighboring H3 cells (ring)
   * @param {string} h3Index - Center H3 index
   * @param {number} k - Ring size (1 = immediate neighbors)
   * @returns {Array<string>} Array of neighboring H3 indices
   */
  getNeighbors(h3Index, k = 1) {
    try {
      return h3.gridDisk(h3Index, k);
    } catch (error) {
      logger.error('Error getting H3 neighbors', { h3Index, k, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate H3 cells within a radius
   * @param {number} lat - Center latitude
   * @param {number} lng - Center longitude
   * @param {number} radiusKm - Radius in kilometers
   * @param {number} resolution - H3 resolution
   * @returns {Array<string>} Array of H3 indices within radius
   */
  getCellsWithinRadius(lat, lng, radiusKm, resolution = this.defaultResolution) {
    try {
      const centerH3 = this.latLngToH3(lat, lng, resolution);
      
      // Calculate approximate ring size based on radius
      // H3 resolution 9: ~350m edge length
      // Use empirical formula: k ≈ radius_km / (edge_length_km * 0.7)
      const edgeLengthKm = this.getEdgeLengthKm(resolution);
      const k = Math.ceil(radiusKm / (edgeLengthKm * 0.7));
      
      // Get all cells in the ring
      const cells = this.getNeighbors(centerH3, k);
      
      // Filter cells that are actually within the radius
      const filteredCells = cells.filter(cell => {
        const cellCenter = this.h3ToLatLng(cell);
        const distance = this.haversineDistance(lat, lng, cellCenter.lat, cellCenter.lng);
        return distance <= radiusKm;
      });
      
      logger.debug('Calculated H3 cells within radius', {
        center: centerH3,
        radiusKm,
        ringSize: k,
        totalCells: cells.length,
        filteredCells: filteredCells.length,
      });
      
      return filteredCells;
    } catch (error) {
      logger.error('Error calculating cells within radius', { 
        lat, lng, radiusKm, resolution, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get edge length for a given H3 resolution in kilometers
   * @param {number} resolution - H3 resolution
   * @returns {number} Edge length in kilometers
   */
  getEdgeLengthKm(resolution) {
    try {
      // Get edge length in meters and convert to km
      const edgeLengthM = h3.getHexagonEdgeLengthAvg(resolution, h3.UNITS.m);
      return edgeLengthM / 1000;
    } catch (error) {
      logger.error('Error getting edge length', { resolution, error: error.message });
      throw error;
    }
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - First point latitude
   * @param {number} lng1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lng2 - Second point longitude
   * @returns {number} Distance in kilometers
   */
  haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validate coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {boolean}
   */
  isValidCoordinate(lat, lng) {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  }

  /**
   * Validate H3 index
   * @param {string} h3Index
   * @returns {boolean}
   */
  isValidH3Index(h3Index) {
    try {
      return h3.isValidCell(h3Index);
    } catch {
      return false;
    }
  }

  /**
   * Get H3 resolution from index
   * @param {string} h3Index
   * @returns {number}
   */
  getResolution(h3Index) {
    try {
      return h3.getResolution(h3Index);
    } catch (error) {
      logger.error('Error getting H3 resolution', { h3Index, error: error.message });
      throw error;
    }
  }

  /**
   * Convert H3 index to parent at coarser resolution
   * @param {string} h3Index
   * @param {number} parentResolution
   * @returns {string}
   */
  toParent(h3Index, parentResolution) {
    try {
      return h3.cellToParent(h3Index, parentResolution);
    } catch (error) {
      logger.error('Error converting to parent H3', { 
        h3Index, parentResolution, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Convert H3 index to children at finer resolution
   * @param {string} h3Index
   * @param {number} childResolution
   * @returns {Array<string>}
   */
  toChildren(h3Index, childResolution) {
    try {
      return h3.cellToChildren(h3Index, childResolution);
    } catch (error) {
      logger.error('Error converting to children H3', { 
        h3Index, childResolution, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get H3 cells covering a polygon
   * @param {Array<Array<number>>} polygon - Array of [lat, lng] coordinates
   * @param {number} resolution
   * @returns {Array<string>}
   */
  polygonToCells(polygon, resolution = this.defaultResolution) {
    try {
      // Convert [[lat, lng], ...] to GeoJSON format
      const geoJsonPolygon = polygon.map(([lat, lng]) => [lng, lat]);
      return h3.polygonToCells([geoJsonPolygon], resolution);
    } catch (error) {
      logger.error('Error converting polygon to H3 cells', { 
        polygon, resolution, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get boundary coordinates of an H3 cell
   * @param {string} h3Index
   * @returns {Array<Object>} Array of {lat, lng} coordinates
   */
  getCellBoundary(h3Index) {
    try {
      const boundary = h3.cellToBoundary(h3Index);
      return boundary.map(([lat, lng]) => ({ lat, lng }));
    } catch (error) {
      logger.error('Error getting H3 cell boundary', { h3Index, error: error.message });
      throw error;
    }
  }

  /**
   * Compact set of H3 cells (optimize for storage)
   * @param {Array<string>} h3Indices
   * @returns {Array<string>}
   */
  compactCells(h3Indices) {
    try {
      return h3.compactCells(h3Indices);
    } catch (error) {
      logger.error('Error compacting H3 cells', { 
        count: h3Indices.length, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Uncompact set of H3 cells
   * @param {Array<string>} compactedH3Indices
   * @param {number} resolution
   * @returns {Array<string>}
   */
  uncompactCells(compactedH3Indices, resolution) {
    try {
      return h3.uncompactCells(compactedH3Indices, resolution);
    } catch (error) {
      logger.error('Error uncompacting H3 cells', { 
        count: compactedH3Indices.length, resolution, error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get optimal search radius suggestions
   * @returns {Array<Object>}
   */
  getRadiusSuggestions() {
    return [
      { label: 'Very Close', radius: 2, description: 'Within 2km' },
      { label: 'Nearby', radius: 5, description: 'Within 5km' },
      { label: 'Local Area', radius: 10, description: 'Within 10km' },
      { label: 'Extended Area', radius: 25, description: 'Within 25km' },
      { label: 'Wide Area', radius: 50, description: 'Within 50km' },
    ];
  }
}

module.exports = new H3Service();