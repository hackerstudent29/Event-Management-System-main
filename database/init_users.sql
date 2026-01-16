-- Event Management System - Database Initialization
-- Run this ONCE manually in your PostgreSQL database

-- Create admin user with fixed password hash
-- Password: Admin@123
-- Hash generated with BCrypt (strength 10)
INSERT INTO users (id, email, password, role, is_verified, created_at)
VALUES (
    '5ae4dd4e-74d5-4032-8826-dfcabf3e3643'::uuid,
    'admin@eventbooking.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    true,
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role = 'ADMIN',
    is_verified = true;

-- Create a regular user for testing
-- Password: User@123
INSERT INTO users (id, email, password, role, is_verified, created_at)
VALUES (
    gen_random_uuid(),
    'testuser@gmail.com',
    '$2a$10$slYQmyNdGzTn7ZXLXtLCpOu5YCzCXWvdmLO0lqKCWIV5o9SlbeB6W',
    'USER',
    true,
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password = '$2a$10$slYQmyNdGzTn7ZXLXtLCpOu5YCzCXWvdmLO0lqKCWIV5o9SlbeB6W',
    role = 'USER',
    is_verified = true;
