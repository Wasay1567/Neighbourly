-- ============================================================================
-- 1. FUNCTION-BASED INDEXES (Replaces PG Partial Indexes)
-- ============================================================================
-- Index only active (not deleted) records
CREATE INDEX idx_users_email_active ON users (CASE WHEN deleted_at IS NULL THEN email END);
CREATE INDEX idx_users_phone_active ON users (CASE WHEN deleted_at IS NULL THEN phone END);
CREATE INDEX idx_services_provider_active ON service_listings (CASE WHEN deleted_at IS NULL THEN provider_id END);

-- Index only primary addresses
CREATE INDEX idx_addresses_primary ON addresses (CASE WHEN is_primary = TRUE THEN user_id END);

-- Index active listings by price/featured
CREATE INDEX idx_srv_price_active ON service_listings (CASE WHEN status = 'active' THEN price_amount END);
CREATE INDEX idx_srv_feat_active ON service_listings (CASE WHEN status = 'active' AND is_featured = TRUE THEN published_at END);

-- ============================================================================
-- 2. ORACLE TEXT (Full-Text Search)
-- ============================================================================
-- Requires CTXAPP role permissions
CREATE INDEX idx_services_fulltext ON service_listings(description) INDEXTYPE IS CTXSYS.CONTEXT;

-- ============================================================================
-- 3. FOREIGN KEY INDEXES (Mandatory for Performance)
-- ============================================================================
CREATE INDEX idx_fk_user_prof ON user_profiles(verified_by);
CREATE INDEX idx_fk_neigh_city ON neighborhoods(city_id);
CREATE INDEX idx_fk_addr_user ON addresses(user_id);
CREATE INDEX idx_fk_addr_city ON addresses(city_id);
CREATE INDEX idx_fk_addr_neigh ON addresses(neighborhood_id);
CREATE INDEX idx_fk_cat_parent ON service_categories(parent_id);
CREATE INDEX idx_fk_srv_prov ON service_listings(provider_id);
CREATE INDEX idx_fk_srv_cat ON service_listings(category_id);
CREATE INDEX idx_fk_srv_addr ON service_listings(address_id);
CREATE INDEX idx_fk_avail_srv ON service_availability(service_id);
CREATE INDEX idx_fk_book_srv ON bookings(service_id);
CREATE INDEX idx_fk_book_seeker ON bookings(seeker_id);
CREATE INDEX idx_fk_book_prov ON bookings(provider_id);
CREATE INDEX idx_fk_rev_book ON reviews(booking_id);
CREATE INDEX idx_fk_tx_book ON transactions(booking_id);
CREATE INDEX idx_fk_tx_payer ON transactions(payer_id);
CREATE INDEX idx_fk_tx_payee ON transactions(payee_id);
CREATE INDEX idx_fk_disp_book ON disputes(booking_id);

-- ============================================================================
-- 4. SPATIAL & OTHER INDEXES
-- ============================================================================
CREATE INDEX idx_addresses_h3_index ON addresses(h3_index);
CREATE INDEX idx_addresses_coords ON addresses(latitude, longitude);
CREATE INDEX idx_services_h3_index ON service_listings(h3_index);
CREATE INDEX idx_reputation_score ON user_reputation(reliability_score DESC, average_rating DESC);
