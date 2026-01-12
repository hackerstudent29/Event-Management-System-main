-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'ADMIN')),
    otp VARCHAR(6),
    otp_expiry TIMESTAMP,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMAIL OTP TABLE (New)
CREATE TABLE IF NOT EXISTS email_otp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    purpose VARCHAR(20) NOT NULL, -- SIGNUP, RESET
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    event_type VARCHAR(50), -- Concert, Theatre, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EVENT CATEGORIES TABLE (New)
-- Manages specific seat categories for each event (e.g., VIP, Gold for Event A)
CREATE TABLE IF NOT EXISTS event_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    category_name VARCHAR(50) NOT NULL, -- General, VIP, etc.
    color VARCHAR(20) NOT NULL, -- Hex code
    arena_position VARCHAR(50) NOT NULL, -- Front, Center, Balcony
    total_seats INT NOT NULL CHECK (total_seats >= 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, category_name) -- Prevent duplicate categories for same event
);

-- BOOKINGS TABLE (Updated)
-- Links to event_category instead of just event
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_category_id UUID NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
    seats_booked INT NOT NULL CHECK (seats_booked > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_event_categories_event_id ON event_categories(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_category_id ON bookings(event_category_id);
