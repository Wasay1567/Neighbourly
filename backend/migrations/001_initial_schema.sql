-- Migration 001: Initial Schema Setup for Neighbourly Stage 2
-- Author: System Architect
-- Date: 2026-01-24
-- Description: Complete normalized schema with H3 support, RBAC, and audit trails

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('seeker', 'provider', 'moderator', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated', 'pending_verification');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE service_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE notification_type AS ENUM ('booking', 'message', 'review', 'system', 'payment');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'status_change', 'permission_override');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table (Normalized with separate profile)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    role user_role NOT NULL DEFAULT 'seeker',
    status user_status NOT NULL DEFAULT 'pending_verification',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- User Profiles (1:1 with users)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150),
    avatar_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    verification_status verification_status DEFAULT 'unverified',
    verification_document_url VARCHAR(500),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT age_requirement CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
);

-- Cities Table
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_city UNIQUE (name, state_province, country)
);

-- Neighborhoods Table
CREATE TABLE neighborhoods (
    id SERIAL PRIMARY KEY,
    city_id INTEGER NOT NULL REFERENCES cities(id),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    h3_resolution INTEGER DEFAULT 9,
    h3_cells TEXT[], -- Array of H3 hexes covering this neighborhood
    boundary_geojson JSONB, -- Optional: store boundary for visualization
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_neighborhood UNIQUE (city_id, name)
);

-- Addresses Table (Normalized location data)
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    street_address VARCHAR(255) NOT NULL,
    apartment VARCHAR(50),
    city_id INTEGER NOT NULL REFERENCES cities(id),
    neighborhood_id INTEGER REFERENCES neighborhoods(id),
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    h3_index VARCHAR(20) NOT NULL, -- H3 hex at resolution 9
    h3_resolution INTEGER DEFAULT 9,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_coordinates CHECK (
        latitude BETWEEN -90 AND 90 AND 
        longitude BETWEEN -180 AND 180
    )
);

-- Service Categories (Hierarchical)
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES service_categories(id),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Service Listings
CREATE TABLE service_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES users(id),
    category_id INTEGER NOT NULL REFERENCES service_categories(id),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency CHAR(3) DEFAULT 'USD',
    price_unit VARCHAR(50) DEFAULT 'per_hour', -- per_hour, per_day, per_item, fixed
    address_id UUID REFERENCES addresses(id),
    h3_index VARCHAR(20), -- For location-based search
    service_radius_km INTEGER DEFAULT 5, -- How far provider willing to travel
    duration_minutes INTEGER, -- Estimated duration
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    tags TEXT[], -- Searchable tags
    status service_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT positive_price CHECK (price_amount >= 0),
    CONSTRAINT positive_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    CONSTRAINT valid_radius CHECK (service_radius_km BETWEEN 1 AND 100)
);

-- Service Availability (Recurring schedule)
CREATE TABLE service_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_day CHECK (day_of_week BETWEEN 0 AND 6),
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT unique_availability UNIQUE (service_id, day_of_week, start_time)
);

-- Booking Requests
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES service_listings(id),
    seeker_id UUID NOT NULL REFERENCES users(id),
    provider_id UUID NOT NULL REFERENCES users(id),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status booking_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    special_instructions TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT no_self_booking CHECK (seeker_id != provider_id),
    CONSTRAINT valid_schedule CHECK (scheduled_end > scheduled_start),
    CONSTRAINT positive_amount CHECK (total_amount >= 0)
);

-- Reviews and Ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    title VARCHAR(150),
    comment TEXT,
    response TEXT, -- Provider/Seeker response
    response_at TIMESTAMP WITH TIME ZONE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id)
);

-- User Reputation Metrics (Denormalized for performance)
CREATE TABLE user_reputation (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_bookings_as_provider INTEGER DEFAULT 0,
    total_bookings_as_seeker INTEGER DEFAULT 0,
    completed_bookings_as_provider INTEGER DEFAULT 0,
    completed_bookings_as_seeker INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0.00,
    response_time_minutes INTEGER, -- Average response time
    reliability_score DECIMAL(5, 2) DEFAULT 0.00, -- Custom algorithm score
    last_active_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_average_rating CHECK (average_rating BETWEEN 0 AND 5),
    CONSTRAINT valid_cancellation_rate CHECK (cancellation_rate BETWEEN 0 AND 100)
);

-- ============================================================================
-- RBAC & PERMISSIONS
-- ============================================================================

-- Permissions Table
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(100) NOT NULL, -- e.g., 'service', 'booking', 'user'
    action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'moderate'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_permission UNIQUE (resource, action)
);

-- Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
    role user_role NOT NULL,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (role, permission_id)
);

-- User-specific Permission Overrides
CREATE TABLE user_permission_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    is_granted BOOLEAN NOT NULL,
    reason TEXT,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT unique_user_permission UNIQUE (user_id, permission_id)
);

-- ============================================================================
-- TRANSACTIONS & PAYMENTS
-- ============================================================================

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    payer_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    net_amount DECIMAL(10, 2) NOT NULL,
    status transaction_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_gateway_ref VARCHAR(255),
    payment_gateway_response JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_transaction_amount CHECK (amount > 0),
    CONSTRAINT valid_net_amount CHECK (net_amount = amount - platform_fee)
);

-- ============================================================================
-- DISPUTES & MODERATION
-- ============================================================================

-- Disputes Table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    raised_by UUID NOT NULL REFERENCES users(id),
    against_user_id UUID NOT NULL REFERENCES users(id),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB, -- Array of evidence URLs/documents
    status dispute_status DEFAULT 'open',
    assigned_moderator_id UUID REFERENCES users(id),
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AUDIT & LOGGING
-- ============================================================================

-- Comprehensive Audit Log (Immutable)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action audit_action NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    performed_by UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Make audit_logs immutable
CREATE RULE audit_logs_immutable AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- ============================================================================
-- NOTIFICATIONS & MESSAGING
-- ============================================================================

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    action_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- CACHING & SEARCH OPTIMIZATION
-- ============================================================================

-- Trending Services Cache (Materialized for performance)
CREATE TABLE trending_services_cache (
    neighborhood_id INTEGER NOT NULL REFERENCES neighborhoods(id),
    service_id UUID NOT NULL REFERENCES service_listings(id),
    trend_score DECIMAL(10, 2) NOT NULL,
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (neighborhood_id, service_id, period)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User Indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_status ON users(role, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Address Indexes (H3 spatial indexing)
CREATE INDEX idx_addresses_h3_index ON addresses(h3_index);
CREATE INDEX idx_addresses_user_id ON addresses(user_id) WHERE is_primary = TRUE;
CREATE INDEX idx_addresses_city_neighborhood ON addresses(city_id, neighborhood_id);
CREATE INDEX idx_addresses_coordinates ON addresses(latitude, longitude);

-- Service Listing Indexes
CREATE INDEX idx_services_provider ON service_listings(provider_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON service_listings(category_id, status);
CREATE INDEX idx_services_h3_index ON service_listings(h3_index) WHERE status = 'active';
CREATE INDEX idx_services_status_published ON service_listings(status, published_at DESC);
CREATE INDEX idx_services_price_range ON service_listings(price_amount) WHERE status = 'active';
CREATE INDEX idx_services_featured ON service_listings(is_featured, published_at DESC) WHERE status = 'active';
CREATE INDEX idx_services_tags ON service_listings USING GIN(tags);
CREATE INDEX idx_services_fulltext ON service_listings USING GIN(to_tsvector('english', title || ' ' || description));

-- Booking Indexes
CREATE INDEX idx_bookings_seeker ON bookings(seeker_id, status, created_at DESC);
CREATE INDEX idx_bookings_provider ON bookings(provider_id, status, created_at DESC);
CREATE INDEX idx_bookings_service ON bookings(service_id, status);
CREATE INDEX idx_bookings_schedule ON bookings(scheduled_start, scheduled_end) WHERE status IN ('pending', 'confirmed');
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_status_date ON bookings(status, created_at DESC);

-- Review Indexes
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id, created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Reputation Index
CREATE INDEX idx_reputation_score ON user_reputation(reliability_score DESC, average_rating DESC);

-- Neighborhood H3 Index (Array search)
CREATE INDEX idx_neighborhoods_h3_cells ON neighborhoods USING GIN(h3_cells);

-- Audit Log Indexes
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_performer ON audit_logs(performed_by, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);

-- Notification Indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Transaction Indexes
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id, created_at DESC);
CREATE INDEX idx_transactions_payee ON transactions(payee_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status, created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_neighborhoods_updated_at BEFORE UPDATE ON neighborhoods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_listings_updated_at BEFORE UPDATE ON service_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', row_to_json(NEW), NEW.id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', row_to_json(OLD), row_to_json(NEW), NEW.id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', row_to_json(OLD), OLD.id);
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_bookings AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_permission_overrides AFTER INSERT OR UPDATE OR DELETE ON user_permission_overrides
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- INITIAL DATA SEEDS
-- ============================================================================

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
('view_own_services', 'service', 'read', 'View own service listings'),
('create_service', 'service', 'create', 'Create new service listings'),
('update_own_service', 'service', 'update', 'Update own service listings'),
('delete_own_service', 'service', 'delete', 'Delete own service listings'),
('view_all_services', 'service', 'read_all', 'View all service listings'),
('moderate_services', 'service', 'moderate', 'Moderate service listings'),
('view_own_bookings', 'booking', 'read', 'View own bookings'),
('create_booking', 'booking', 'create', 'Create booking requests'),
('update_own_booking', 'booking', 'update', 'Update own bookings'),
('cancel_booking', 'booking', 'cancel', 'Cancel bookings'),
('view_all_bookings', 'booking', 'read_all', 'View all bookings'),
('moderate_bookings', 'booking', 'moderate', 'Moderate bookings'),
('view_own_profile', 'user', 'read', 'View own profile'),
('update_own_profile', 'user', 'update', 'Update own profile'),
('view_all_users', 'user', 'read_all', 'View all users'),
('moderate_users', 'user', 'moderate', 'Moderate users'),
('manage_permissions', 'permission', 'manage', 'Manage permissions'),
('view_analytics', 'analytics', 'read', 'View analytics dashboard'),
('manage_disputes', 'dispute', 'manage', 'Manage disputes'),
('view_audit_logs', 'audit', 'read', 'View audit logs');

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'seeker', id FROM permissions WHERE name IN (
    'view_all_services', 'view_own_bookings', 'create_booking', 
    'update_own_booking', 'cancel_booking', 'view_own_profile', 'update_own_profile'
);

INSERT INTO role_permissions (role, permission_id)
SELECT 'provider', id FROM permissions WHERE name IN (
    'view_own_services', 'create_service', 'update_own_service', 'delete_own_service',
    'view_own_bookings', 'update_own_booking', 'cancel_booking', 
    'view_own_profile', 'update_own_profile', 'view_all_services'
);

INSERT INTO role_permissions (role, permission_id)
SELECT 'moderator', id FROM permissions WHERE name IN (
    'view_all_services', 'moderate_services', 'view_all_bookings', 'moderate_bookings',
    'view_all_users', 'moderate_users', 'manage_disputes', 'view_analytics'
);

INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- Insert sample service categories
INSERT INTO service_categories (name, slug, description) VALUES
('Home Services', 'home-services', 'Services related to home maintenance and improvement'),
('Education & Tutoring', 'education-tutoring', 'Educational and tutoring services'),
('Professional Services', 'professional-services', 'Professional and business services'),
('Creative Services', 'creative-services', 'Creative and artistic services'),
('Health & Wellness', 'health-wellness', 'Health and wellness services'),
('Transportation', 'transportation', 'Transportation and delivery services'),
('Pet Services', 'pet-services', 'Pet care and related services'),
('Events', 'events', 'Event planning and services');

-- Insert subcategories
INSERT INTO service_categories (parent_id, name, slug, description) VALUES
(1, 'Plumbing', 'plumbing', 'Plumbing repair and installation'),
(1, 'Electrical', 'electrical', 'Electrical work and repairs'),
(1, 'Cleaning', 'cleaning', 'House and apartment cleaning'),
(1, 'Gardening', 'gardening', 'Lawn care and gardening'),
(2, 'Math Tutoring', 'math-tutoring', 'Mathematics tutoring for all levels'),
(2, 'Language Learning', 'language-learning', 'Foreign language instruction'),
(3, 'Consulting', 'consulting', 'Business and professional consulting'),
(3, 'Legal Services', 'legal-services', 'Legal advice and services'),
(4, 'Graphic Design', 'graphic-design', 'Graphic design and branding'),
(4, 'Photography', 'photography', 'Photography services'),
(5, 'Fitness Training', 'fitness-training', 'Personal fitness training'),
(5, 'Massage Therapy', 'massage-therapy', 'Therapeutic massage services');

COMMIT;

-- ============================================================================
-- POST-MIGRATION NOTES
-- ============================================================================
-- 1. Remember to set up connection pooling (pg_bouncer recommended)
-- 2. Configure WAL archiving for point-in-time recovery
-- 3. Set up regular VACUUM and ANALYZE schedules
-- 4. Monitor index usage and table bloat
-- 5. Implement row-level security (RLS) policies for multi-tenancy if needed
-- 6. Set up read replicas for read-heavy workloads
-- 7. Configure appropriate statement_timeout and lock_timeout values
-- 8. Enable pg_stat_statements for query performance monitoring