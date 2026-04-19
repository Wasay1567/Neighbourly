-- User Domain
ALTER TABLE user_profiles ADD CONSTRAINT fk_prof_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_profiles ADD CONSTRAINT fk_prof_verifier FOREIGN KEY (verified_by) REFERENCES users(id);
ALTER TABLE user_reputation ADD CONSTRAINT fk_rep_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Geography Domain
ALTER TABLE neighborhoods ADD CONSTRAINT fk_neigh_city FOREIGN KEY (city_id) REFERENCES cities(id);
ALTER TABLE addresses ADD CONSTRAINT fk_addr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE addresses ADD CONSTRAINT fk_addr_city FOREIGN KEY (city_id) REFERENCES cities(id);
ALTER TABLE addresses ADD CONSTRAINT fk_addr_neigh FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);

-- Service Domain
ALTER TABLE service_categories ADD CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES service_categories(id);
ALTER TABLE service_listings ADD CONSTRAINT fk_srv_prov FOREIGN KEY (provider_id) REFERENCES users(id);
ALTER TABLE service_listings ADD CONSTRAINT fk_srv_cat FOREIGN KEY (category_id) REFERENCES service_categories(id);
ALTER TABLE service_listings ADD CONSTRAINT fk_srv_addr FOREIGN KEY (address_id) REFERENCES addresses(id);
ALTER TABLE service_availability ADD CONSTRAINT fk_avail_srv FOREIGN KEY (service_id) REFERENCES service_listings(id) ON DELETE CASCADE;

-- Booking Domain
ALTER TABLE bookings ADD CONSTRAINT fk_book_srv FOREIGN KEY (service_id) REFERENCES service_listings(id);
ALTER TABLE bookings ADD CONSTRAINT fk_book_seeker FOREIGN KEY (seeker_id) REFERENCES users(id);
ALTER TABLE bookings ADD CONSTRAINT fk_book_prov FOREIGN KEY (provider_id) REFERENCES users(id);
ALTER TABLE bookings ADD CONSTRAINT fk_book_cancellation FOREIGN KEY (cancellation_id) REFERENCES cancellations(id);

ALTER TABLE cancellations ADD CONSTRAINT fk_cancel_user FOREIGN KEY (cancelled_by) REFERENCES users(id);

ALTER TABLE reviews ADD CONSTRAINT fk_rev_book FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE reviews ADD CONSTRAINT fk_rev_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id);
ALTER TABLE reviews ADD CONSTRAINT fk_rev_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id);

ALTER TABLE transactions ADD CONSTRAINT fk_tx_book FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE transactions ADD CONSTRAINT fk_tx_payer FOREIGN KEY (payer_id) REFERENCES users(id);
ALTER TABLE transactions ADD CONSTRAINT fk_tx_payee FOREIGN KEY (payee_id) REFERENCES users(id);

ALTER TABLE disputes ADD CONSTRAINT fk_disp_book FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE disputes ADD CONSTRAINT fk_disp_raiser FOREIGN KEY (raised_by) REFERENCES users(id);
ALTER TABLE disputes ADD CONSTRAINT fk_disp_against FOREIGN KEY (against_user_id) REFERENCES users(id);
ALTER TABLE disputes ADD CONSTRAINT fk_disp_mod FOREIGN KEY (assigned_moderator_id) REFERENCES users(id);

-- Permission Domain
ALTER TABLE role_permissions ADD CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
ALTER TABLE user_permission_overrides ADD CONSTRAINT fk_upo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_permission_overrides ADD CONSTRAINT fk_upo_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
ALTER TABLE user_permission_overrides ADD CONSTRAINT fk_upo_granter FOREIGN KEY (granted_by) REFERENCES users(id);

-- Cache
ALTER TABLE trending_services_cache ADD CONSTRAINT fk_trend_neigh FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);
ALTER TABLE trending_services_cache ADD CONSTRAINT fk_trend_srv FOREIGN KEY (service_id) REFERENCES service_listings(id);
