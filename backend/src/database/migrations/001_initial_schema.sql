PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

);

CREATE TABLE services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price_per_hour REAL NOT NULL CHECK (price_per_hour >= 0),
    is_active boolean DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (provider_id) REFERENCES users(id)
);

CREATE TABLE service_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_booked INTEGER DEFAULT 0,

    CHECK (end_time > start_time),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

/* =========================
   BOOKINGS
   ========================= */
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    seeker_id INTEGER NOT NULL,
    availability_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN ('requested', 'confirmed', 'completed', 'cancelled')
    ),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (seeker_id) REFERENCES users(id),
    FOREIGN KEY (availability_id) REFERENCES service_availability(id),

    /* Prevent self-booking */
    CHECK (
        seeker_id != (
            SELECT provider_id FROM services WHERE services.id = service_id
        )
    )
);


/* =========================
   INDEXES (Performance)
   ========================= */
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_bookings_seeker ON bookings(seeker_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_availability_service ON service_availability(service_id);
