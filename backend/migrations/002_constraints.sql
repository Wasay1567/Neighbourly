BEGIN;

-- PRIMARY KEYS
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);
ALTER TABLE cities ADD CONSTRAINT cities_pkey PRIMARY KEY (id);
ALTER TABLE neighborhoods ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);
ALTER TABLE addresses ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);
ALTER TABLE service_categories ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_pkey PRIMARY KEY (id);
ALTER TABLE service_availability ADD CONSTRAINT service_availability_pkey PRIMARY KEY (id);
ALTER TABLE cancellations ADD CONSTRAINT cancellations_pkey PRIMARY KEY (id);
ALTER TABLE bookings ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);
ALTER TABLE reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE user_reputation ADD CONSTRAINT user_reputation_pkey PRIMARY KEY (user_id);
ALTER TABLE permissions ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role, permission_id);
ALTER TABLE user_permission_overrides ADD CONSTRAINT user_permission_overrides_pkey PRIMARY KEY (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
ALTER TABLE disputes ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);
ALTER TABLE trending_services_cache ADD CONSTRAINT trending_services_cache_pkey PRIMARY KEY (neighborhood_id, service_id, period);

-- UNIQUE CONSTRAINTS
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
ALTER TABLE cities ADD CONSTRAINT cities_unique_city UNIQUE (name, state_province, country);
ALTER TABLE neighborhoods ADD CONSTRAINT neighborhoods_unique_neighborhood UNIQUE (city_id, name);
ALTER TABLE service_categories ADD CONSTRAINT service_categories_slug_unique UNIQUE (slug);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_slug_unique UNIQUE (slug);
ALTER TABLE service_availability ADD CONSTRAINT service_availability_unique_availability UNIQUE (service_id, day_of_week, start_time);
ALTER TABLE bookings ADD CONSTRAINT bookings_reference_unique UNIQUE (booking_reference);
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id);
ALTER TABLE permissions ADD CONSTRAINT permissions_name_unique UNIQUE (name);
ALTER TABLE permissions ADD CONSTRAINT permissions_resource_action_unique UNIQUE (resource, action);
ALTER TABLE user_permission_overrides ADD CONSTRAINT user_permission_overrides_user_permission_unique UNIQUE (user_id, permission_id);

-- CHECK CONSTRAINTS
ALTER TABLE users ADD CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT users_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_age_requirement CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '18 years');
ALTER TABLE addresses ADD CONSTRAINT addresses_valid_coordinates CHECK (latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180);
ALTER TABLE service_categories ADD CONSTRAINT service_categories_no_self_reference CHECK (id != parent_id);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_positive_price CHECK (price_amount >= 0);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_positive_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_valid_radius CHECK (service_radius_km BETWEEN 1 AND 100);
ALTER TABLE service_availability ADD CONSTRAINT service_availability_valid_day CHECK (day_of_week BETWEEN 0 AND 6);
ALTER TABLE service_availability ADD CONSTRAINT service_availability_valid_time_range CHECK (end_time > start_time);
ALTER TABLE bookings ADD CONSTRAINT bookings_no_self_booking CHECK (seeker_id != provider_id);
ALTER TABLE bookings ADD CONSTRAINT bookings_valid_schedule CHECK (scheduled_end > scheduled_start);
ALTER TABLE bookings ADD CONSTRAINT bookings_positive_amount CHECK (total_amount >= 0);
ALTER TABLE reviews ADD CONSTRAINT reviews_valid_rating CHECK (rating BETWEEN 1 AND 5);
ALTER TABLE reviews ADD CONSTRAINT reviews_no_self_review CHECK (reviewer_id != reviewee_id);
ALTER TABLE user_reputation ADD CONSTRAINT user_reputation_valid_average_rating CHECK (average_rating BETWEEN 0 AND 5);
ALTER TABLE user_reputation ADD CONSTRAINT user_reputation_valid_cancellation_rate CHECK (cancellation_rate BETWEEN 0 AND 100);
ALTER TABLE transactions ADD CONSTRAINT transactions_positive_amount CHECK (amount > 0);
ALTER TABLE transactions ADD CONSTRAINT transactions_valid_net_amount CHECK (net_amount = amount - platform_fee);

-- FOREIGN KEYS
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES users(id);
ALTER TABLE neighborhoods ADD CONSTRAINT neighborhoods_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id);
ALTER TABLE addresses ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE addresses ADD CONSTRAINT addresses_city_id_fkey FOREIGN KEY (city_id) REFERENCES cities(id);
ALTER TABLE addresses ADD CONSTRAINT addresses_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);
ALTER TABLE service_categories ADD CONSTRAINT service_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES service_categories(id);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES users(id);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_category_id_fkey FOREIGN KEY (category_id) REFERENCES service_categories(id);
ALTER TABLE service_listings ADD CONSTRAINT service_listings_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses(id);
ALTER TABLE service_availability ADD CONSTRAINT service_availability_service_id_fkey FOREIGN KEY (service_id) REFERENCES service_listings(id) ON DELETE CASCADE;
ALTER TABLE cancellations ADD CONSTRAINT cancellations_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES users(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES service_listings(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_seeker_id_fkey FOREIGN KEY (seeker_id) REFERENCES users(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES users(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_cancellation_id_fkey FOREIGN KEY (cancellation_id) REFERENCES cancellations(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES users(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES users(id);
ALTER TABLE user_reputation ADD CONSTRAINT user_reputation_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
ALTER TABLE user_permission_overrides ADD CONSTRAINT user_permission_overrides_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_permission_overrides ADD CONSTRAINT user_permission_overrides_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
ALTER TABLE user_permission_overrides ADD CONSTRAINT user_permission_overrides_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(id);
ALTER TABLE transactions ADD CONSTRAINT transactions_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE transactions ADD CONSTRAINT transactions_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES users(id);
ALTER TABLE transactions ADD CONSTRAINT transactions_payee_id_fkey FOREIGN KEY (payee_id) REFERENCES users(id);
ALTER TABLE disputes ADD CONSTRAINT disputes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE disputes ADD CONSTRAINT disputes_raised_by_fkey FOREIGN KEY (raised_by) REFERENCES users(id);
ALTER TABLE disputes ADD CONSTRAINT disputes_against_user_id_fkey FOREIGN KEY (against_user_id) REFERENCES users(id);
ALTER TABLE disputes ADD CONSTRAINT disputes_assigned_moderator_id_fkey FOREIGN KEY (assigned_moderator_id) REFERENCES users(id);
ALTER TABLE trending_services_cache ADD CONSTRAINT trending_services_cache_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);
ALTER TABLE trending_services_cache ADD CONSTRAINT trending_services_cache_service_id_fkey FOREIGN KEY (service_id) REFERENCES service_listings(id);

COMMIT;
