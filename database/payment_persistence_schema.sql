-- Add persistence for pending payments and extended seat holds
-- To fix 'sometimes booking fails' issue due to server restarts or hold timeouts

-- 1. Create Pending Payments Table
CREATE TABLE IF NOT EXISTS pending_payments (
    reference_id VARCHAR(255) PRIMARY KEY,
    booking_payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Update Seat Holds Table
ALTER TABLE seat_holds ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255);
ALTER TABLE seat_holds ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'HELD';

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_seat_holds_reference_id ON seat_holds(reference_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_created_at ON pending_payments(created_at);
