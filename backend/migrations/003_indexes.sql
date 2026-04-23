BEGIN;

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

-- Transaction Indexes
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_transactions_payer ON transactions(payer_id, created_at DESC);
CREATE INDEX idx_transactions_payee ON transactions(payee_id, created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status, created_at DESC);

COMMIT;
