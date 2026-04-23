BEGIN;

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

-- Insert sample cities (Pakistan)
INSERT INTO cities (name, state_province, country, country_code, timezone) VALUES
('Karachi', 'Sindh', 'Pakistan', 'PK', 'Asia/Karachi'),
('Lahore', 'Punjab', 'Pakistan', 'PK', 'Asia/Karachi'),
('Islamabad', 'Islamabad Capital Territory', 'Pakistan', 'PK', 'Asia/Karachi');

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
