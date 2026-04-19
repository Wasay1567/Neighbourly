-- ============================================================================
-- NEIGHBOURLY ORACLE ROLLBACK SCRIPT (DOWN MIGRATION)
-- ============================================================================
-- Description: Drops all objects in reverse order of dependency.
-- Use this if the migration fails or you need to reset the schema.

-- 1. DROP CACHE & PERMISSIONS
DROP TABLE trending_services_cache;
DROP TABLE user_permission_overrides;
DROP TABLE role_permissions;
DROP TABLE permissions;

-- 2. DROP TRANSACTIONS & BOOKINGS
DROP TABLE disputes;
DROP TABLE transactions;
DROP TABLE reviews;
DROP TABLE bookings;

-- 3. DROP SERVICES
DROP TABLE service_availability;
DROP TABLE service_listings;
DROP TABLE service_categories;

-- 4. DROP GEOGRAPHY
DROP TABLE addresses;
DROP TABLE neighborhoods;
DROP TABLE cities;

-- 5. DROP USERS
DROP TABLE user_reputation;
DROP TABLE user_profiles;
DROP TABLE users;

-- 6. DROP UTILITIES
-- (Oracle Text indexes are dropped with the tables, but we clean up the preference if created)
-- EXEC CTX_DDL.DROP_PREFERENCE('service_lexer');

COMMIT;
PROMPT Rollback complete. Schema is clean.
