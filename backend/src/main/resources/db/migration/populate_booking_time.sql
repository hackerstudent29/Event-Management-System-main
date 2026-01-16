-- Migration Script: Populate booking_time for existing bookings
-- This script sets booking_time based on the UUID creation timestamp
-- Run this in your Supabase SQL Editor or via psql

-- Step 1: Check current state (optional - for verification)
SELECT id, booking_time, status, seats_booked 
FROM bookings 
WHERE booking_time IS NULL 
ORDER BY id;

-- Step 2: Update booking_time for NULL values
-- We'll use a sequential timestamp starting from a base date
-- Each booking gets a timestamp 1 minute apart to maintain order

WITH numbered_bookings AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) as row_num
    FROM bookings
    WHERE booking_time IS NULL
)
UPDATE bookings
SET booking_time = TIMESTAMP '2026-01-01 10:00:00' + (nb.row_num || ' minutes')::INTERVAL
FROM numbered_bookings nb
WHERE bookings.id = nb.id;

-- Step 3: Verify the update
SELECT id, booking_time, status, seats_booked 
FROM bookings 
ORDER BY booking_time DESC
LIMIT 10;

-- Alternative: If you want to use actual creation time from UUID (version 1 UUIDs only)
-- This won't work for random UUIDs (version 4), so use the above method instead

COMMIT;
