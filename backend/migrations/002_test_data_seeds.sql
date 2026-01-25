-- Test Data Seeds for Neighbourly Stage 2
-- Run this after running 001_initial_schema.sql

BEGIN;

-- ============================================================================
-- CITIES
-- ============================================================================

INSERT INTO cities (name, state_province, country, latitude, longitude, population) VALUES
('New York', 'New York', 'USA', 40.7128, -74.0060, 8336817),
('Los Angeles', 'California', 'USA', 34.0522, -118.2437, 3979576),
('Chicago', 'Illinois', 'USA', 41.8781, -87.6298, 2693976),
('San Francisco', 'California', 'USA', 37.7749, -122.4194, 873965),
('Seattle', 'Washington', 'USA', 47.6062, -122.3321, 753675);

-- ============================================================================
-- NEIGHBORHOODS
-- ============================================================================

-- New York Neighborhoods
INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Manhattan', 
  'manhattan',
  40.7831,
  -73.9712,
  8.5,
  1628706,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'New York';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Brooklyn', 
  'brooklyn',
  40.6782,
  -73.9442,
  9.5,
  2736074,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'New York';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Queens', 
  'queens',
  40.7282,
  -73.7949,
  11.2,
  2405464,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'New York';

-- Los Angeles Neighborhoods
INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Downtown LA', 
  'downtown-la',
  34.0407,
  -118.2468,
  3.5,
  85000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Los Angeles';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Hollywood', 
  'hollywood',
  34.0928,
  -118.3287,
  5.2,
  300000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Los Angeles';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Santa Monica', 
  'santa-monica',
  34.0195,
  -118.4912,
  4.1,
  93000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Los Angeles';

-- Chicago Neighborhoods
INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Loop', 
  'loop',
  41.8781,
  -87.6298,
  2.5,
  29283,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Chicago';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Lincoln Park', 
  'lincoln-park',
  41.9230,
  -87.6519,
  3.8,
  64116,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Chicago';

-- San Francisco Neighborhoods
INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Mission District', 
  'mission-district',
  37.7599,
  -122.4148,
  2.2,
  60000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'San Francisco';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'SoMa', 
  'soma',
  37.7749,
  -122.4194,
  1.8,
  12000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'San Francisco';

-- Seattle Neighborhoods
INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Capitol Hill', 
  'capitol-hill',
  47.6249,
  -122.3220,
  2.5,
  34000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Seattle';

INSERT INTO neighborhoods (city_id, name, slug, center_lat, center_lng, avg_radius_km, population, h3_cells)
SELECT 
  id, 
  'Ballard', 
  'ballard',
  47.6688,
  -122.3840,
  3.1,
  18000,
  ARRAY['8c2a100d2b9ffff']::varchar[]
FROM cities WHERE name = 'Seattle';

COMMIT;

-- Display inserted data
SELECT 'Cities inserted:' as message;
SELECT id, name, state_province, country FROM cities ORDER BY id;

SELECT 'Neighborhoods inserted:' as message;
SELECT n.id, n.name, c.name as city FROM neighborhoods n
INNER JOIN cities c ON n.city_id = c.id
ORDER BY c.name, n.name;
