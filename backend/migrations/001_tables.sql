BEGIN;

-- ============================================================================
-- 1. EXTENSIONS & TYPES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
-- 2. IDENTITY & REPUTATION
-- ============================================================================

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'seeker',
    status user_status NOT NULL DEFAULT 'pending_verification',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_profiles (
    user_id UUID,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150),
    avatar_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    verification_status verification_status DEFAULT 'unverified',
    verification_document_url VARCHAR(500),
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_reputation (
    user_id UUID,
    total_reviews INTEGER DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_bookings_as_provider INTEGER DEFAULT 0,
    total_bookings_as_seeker INTEGER DEFAULT 0,
    completed_bookings_as_provider INTEGER DEFAULT 0,
    completed_bookings_as_seeker INTEGER DEFAULT 0,
    cancellation_rate DECIMAL(5, 2) DEFAULT 0.00,
    response_time_minutes INTEGER,
    reliability_score DECIMAL(5, 2) DEFAULT 0.00,
    last_active_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. GEOGRAPHY & LOCATION
-- ============================================================================

CREATE TABLE cities (
    id SERIAL,
    name VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE neighborhoods (
    id SERIAL,
    city_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150),
    description TEXT,
    h3_resolution INTEGER DEFAULT 10,
    h3_cells TEXT[],
    boundary_geojson JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE addresses (
    id UUID DEFAULT uuid_generate_v4(),
    user_id UUID,
    street_address VARCHAR(255) NOT NULL,
    apartment VARCHAR(50),
    city_id INTEGER NOT NULL,
    neighborhood_id INTEGER,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    h3_index VARCHAR(20) NOT NULL,
    h3_resolution INTEGER DEFAULT 9,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. SERVICES & LISTINGS
-- ============================================================================

CREATE TABLE service_categories (
    id SERIAL,
    parent_id INTEGER,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_listings (
    id UUID DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    price_amount DECIMAL(10, 2) NOT NULL,
    price_currency CHAR(3) DEFAULT 'USD',
    price_unit VARCHAR(50) DEFAULT 'per_hour',
    address_id UUID,
    h3_index VARCHAR(20),
    service_radius_km INTEGER DEFAULT 5,
    duration_minutes INTEGER,
    images JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    status service_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE service_availability (
    id UUID DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. BOOKINGS & LOGISTICS
-- ============================================================================

CREATE TABLE cancellations (
    id UUID DEFAULT uuid_generate_v4(),
    reason TEXT,
    cancelled_by UUID,
    cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL,
    seeker_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    booking_reference VARCHAR(20) NOT NULL,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    status booking_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'USD',
    special_instructions TEXT,
    cancellation_id UUID,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    reviewee_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    title VARCHAR(150),
    comment TEXT,
    response TEXT,
    response_at TIMESTAMP WITH TIME ZONE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disputes (
    id UUID DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    raised_by UUID NOT NULL,
    against_user_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    evidence JSONB,
    status dispute_status DEFAULT 'open',
    assigned_moderator_id UUID,
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. FINANCIALS
-- ============================================================================

CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL,
    payer_id UUID NOT NULL,
    payee_id UUID NOT NULL,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. ACCESS CONTROL (RBAC)
-- ============================================================================

CREATE TABLE permissions (
    id SERIAL,
    name VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role user_role NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_permission_overrides (
    id UUID DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    permission_id INTEGER NOT NULL,
    is_granted BOOLEAN NOT NULL,
    reason TEXT,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 8. SYSTEM & CACHE
-- ============================================================================

CREATE TABLE trending_services_cache (
    neighborhood_id INTEGER NOT NULL,
    service_id UUID NOT NULL,
    trend_score DECIMAL(10, 2) NOT NULL,
    period VARCHAR(20) NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
