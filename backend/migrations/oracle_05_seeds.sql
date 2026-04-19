-- Permissions
INSERT INTO permissions (name, resource, action, description) VALUES ('view_own_services', 'service', 'read', 'View own service listings');
INSERT INTO permissions (name, resource, action, description) VALUES ('create_service', 'service', 'create', 'Create new service listings');
INSERT INTO permissions (name, resource, action, description) VALUES ('moderate_services', 'service', 'moderate', 'Moderate service listings');

-- Role-Permission Mapping
INSERT INTO role_permissions (role, permission_id) 
SELECT 'seeker', id FROM permissions WHERE name IN ('view_own_services');

-- Cities (Pakistan)
INSERT INTO cities (name, state_province, country, country_code, timezone) VALUES ('Karachi', 'Sindh', 'Pakistan', 'PK', 'Asia/Karachi');
INSERT INTO cities (name, state_province, country, country_code, timezone) VALUES ('Lahore', 'Punjab', 'Pakistan', 'PK', 'Asia/Karachi');
INSERT INTO cities (name, state_province, country, country_code, timezone) VALUES ('Islamabad', 'Islamabad Capital Territory', 'Pakistan', 'PK', 'Asia/Karachi');

-- Service Categories
INSERT INTO service_categories (name, slug, description) VALUES ('Home Services', 'home-services', 'Home maintenance');
INSERT INTO service_categories (name, slug, description) VALUES ('Education', 'education', 'Tutoring');

COMMIT;
