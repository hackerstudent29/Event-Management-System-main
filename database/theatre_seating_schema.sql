-- ============================================================================
-- PHASE 2: THEATRE SEATING DATABASE SCHEMA
-- Implements strict business rules from the final specification
-- ============================================================================

-- 1. THEATRE CONFIGURATIONS
-- Stores the overall configuration for each theatre event
CREATE TABLE theatre_configurations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    subtype VARCHAR(50) NOT NULL, -- IMAX, Standard Cinema, Dolby Atmos, etc.
    total_capacity INT NOT NULL,
    is_fixed_layout BOOLEAN DEFAULT FALSE, -- TRUE for ScreenX
    gap_rule VARCHAR(20) NOT NULL, -- 'none', 'midpoint', 'every4'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(event_id),
    CONSTRAINT valid_subtype CHECK (subtype IN (
        'IMAX', 'Standard Cinema', 'Dolby Atmos', '4DX', 'ScreenX', 
        'Drive-In', 'Premium Lounge', 'VIP Pods', 'Outdoor Cinema'
    )),
    CONSTRAINT valid_gap_rule CHECK (gap_rule IN ('none', 'midpoint', 'every4'))
);

-- Index for faster event lookups
CREATE INDEX idx_theatre_config_event ON theatre_configurations(event_id);

-- 2. THEATRE CATEGORIES
-- Stores pricing and color for each category within a theatre
CREATE TABLE theatre_categories (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT NOT NULL REFERENCES theatre_configurations(id) ON DELETE CASCADE,
    category_name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    color VARCHAR(7), -- Hex color code (e.g., #FF5733)
    total_seats INT NOT NULL DEFAULT 0, -- Total seats in this category
    available_seats INT NOT NULL DEFAULT 0, -- Remaining available seats
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(config_id, category_name),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$' OR color IS NULL),
    CONSTRAINT valid_seat_counts CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- Index for faster category lookups
CREATE INDEX idx_theatre_category_config ON theatre_categories(config_id);

-- 3. THEATRE ROWS
-- Stores row configuration (which rows belong to which category)
CREATE TABLE theatre_rows (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT NOT NULL REFERENCES theatre_configurations(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES theatre_categories(id) ON DELETE CASCADE,
    row_number INT NOT NULL,
    row_label VARCHAR(2) NOT NULL, -- A, B, C, etc.
    seats_per_row INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(config_id, row_number),
    CONSTRAINT valid_row_number CHECK (row_number > 0 AND row_number <= 26),
    CONSTRAINT valid_seats_per_row CHECK (seats_per_row > 0)
);

-- Index for faster row lookups
CREATE INDEX idx_theatre_row_config ON theatre_rows(config_id);
CREATE INDEX idx_theatre_row_category ON theatre_rows(category_id);

-- 4. THEATRE SEATS
-- Stores individual seat information and booking status
CREATE TABLE theatre_seats (
    id BIGSERIAL PRIMARY KEY,
    row_id BIGINT NOT NULL REFERENCES theatre_rows(id) ON DELETE CASCADE,
    seat_number INT NOT NULL,
    seat_label VARCHAR(10) NOT NULL, -- A1, A2, B1, etc.
    is_booked BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE, -- For admin hold/reserve
    booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
    locked_until TIMESTAMP, -- Temporary lock during booking process
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(row_id, seat_number),
    CONSTRAINT valid_seat_number CHECK (seat_number > 0)
);

-- Indexes for faster seat lookups and availability checks
CREATE INDEX idx_theatre_seat_row ON theatre_seats(row_id);
CREATE INDEX idx_theatre_seat_booking ON theatre_seats(booking_id);
CREATE INDEX idx_theatre_seat_availability ON theatre_seats(row_id, is_booked) WHERE is_booked = FALSE;

-- 5. THEATRE VALIDATION RULES
-- Stores subtype-specific validation rules
CREATE TABLE theatre_validation_rules (
    id BIGSERIAL PRIMARY KEY,
    subtype VARCHAR(50) NOT NULL UNIQUE,
    max_capacity INT NOT NULL,
    allowed_seats_per_row INT[], -- NULL means any, or array like {4,8,12,16} for 4DX
    allowed_categories TEXT[], -- Array of allowed category names
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_max_capacity CHECK (max_capacity > 0)
);

-- Insert validation rules per spec
INSERT INTO theatre_validation_rules (subtype, max_capacity, allowed_seats_per_row, allowed_categories) VALUES
('IMAX', 400, NULL, ARRAY['VIP', 'Elite', 'Standard', 'Front Row', 'Balcony']),
('Standard Cinema', 320, NULL, ARRAY['Platinum', 'Gold', 'Silver', 'Front Row', 'Balcony']),
('Dolby Atmos', 260, NULL, ARRAY['Premium', 'Gold', 'Silver', 'Front Row', 'Recliner']),
('4DX', 160, ARRAY[4,8,12,16], ARRAY['Motion Premium', 'Motion Standard', 'Rear Safe Zone']),
('ScreenX', 180, NULL, ARRAY['Immersion Center', 'Side Immersion', 'Standard', 'Rear']),
('Drive-In', 100, NULL, ARRAY['Front Parking', 'Middle Parking', 'Rear Parking', 'SUV']),
('Premium Lounge', 96, NULL, ARRAY['Recliner Premium', 'Recliner Standard']),
('VIP Pods', 24, NULL, ARRAY['VIP Pod']),
('Outdoor Cinema', 200, NULL, ARRAY['Premium Chairs', 'Standard Chairs', 'Back Lawn']);

-- 6. SCREENX FIXED LAYOUT
-- Stores the fixed pyramid layout for ScreenX (cannot be modified)
CREATE TABLE screenx_fixed_layout (
    id BIGSERIAL PRIMARY KEY,
    row_number INT NOT NULL UNIQUE,
    seats_per_row INT NOT NULL,
    default_category VARCHAR(50) NOT NULL,
    CONSTRAINT valid_screenx_row CHECK (row_number BETWEEN 1 AND 11),
    CONSTRAINT valid_screenx_seats CHECK (seats_per_row BETWEEN 8 AND 22)
);

-- Insert ScreenX fixed layout per spec
INSERT INTO screenx_fixed_layout (row_number, seats_per_row, default_category) VALUES
(1, 8, 'Rear'),
(2, 10, 'Rear'),
(3, 12, 'Standard'),
(4, 14, 'Standard'),
(5, 16, 'Standard'),
(6, 18, 'Side Immersion'),
(7, 20, 'Immersion Center'),
(8, 20, 'Immersion Center'),
(9, 20, 'Immersion Center'),
(10, 20, 'Immersion Center'),
(11, 22, 'Side Immersion');

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to validate 4DX seat count
CREATE OR REPLACE FUNCTION validate_4dx_seats(seats INT) 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN seats IN (4, 8, 12, 16);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate total capacity
CREATE OR REPLACE FUNCTION calculate_theatre_capacity(config_id_param BIGINT)
RETURNS INT AS $$
DECLARE
    total INT;
BEGIN
    SELECT SUM(seats_per_row) INTO total
    FROM theatre_rows
    WHERE config_id = config_id_param;
    RETURN COALESCE(total, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update category seat counts
CREATE OR REPLACE FUNCTION update_category_seat_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_seats for the category
    UPDATE theatre_categories
    SET total_seats = (
        SELECT COUNT(*)
        FROM theatre_seats ts
        JOIN theatre_rows tr ON ts.row_id = tr.id
        WHERE tr.category_id = NEW.category_id
    ),
    available_seats = (
        SELECT COUNT(*)
        FROM theatre_seats ts
        JOIN theatre_rows tr ON ts.row_id = tr.id
        WHERE tr.category_id = NEW.category_id
        AND ts.is_booked = FALSE
    )
    WHERE id = NEW.category_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update category seat counts
CREATE TRIGGER update_category_counts_on_seat_change
AFTER INSERT OR UPDATE ON theatre_seats
FOR EACH ROW
EXECUTE FUNCTION update_category_seat_counts();

-- Function to auto-generate seats for a row
CREATE OR REPLACE FUNCTION generate_seats_for_row(row_id_param BIGINT)
RETURNS VOID AS $$
DECLARE
    row_record RECORD;
    seat_num INT;
BEGIN
    -- Get row details
    SELECT row_label, seats_per_row INTO row_record
    FROM theatre_rows
    WHERE id = row_id_param;
    
    -- Generate seats
    FOR seat_num IN 1..row_record.seats_per_row LOOP
        INSERT INTO theatre_seats (row_id, seat_number, seat_label)
        VALUES (row_id_param, seat_num, row_record.row_label || seat_num);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: Complete theatre layout with all details
CREATE OR REPLACE VIEW v_theatre_layout AS
SELECT 
    tc.id AS config_id,
    tc.event_id,
    tc.subtype,
    tc.total_capacity,
    tc.is_fixed_layout,
    tc.gap_rule,
    tcat.id AS category_id,
    tcat.category_name,
    tcat.price,
    tcat.color,
    tcat.total_seats AS category_total_seats,
    tcat.available_seats AS category_available_seats,
    tr.id AS row_id,
    tr.row_number,
    tr.row_label,
    tr.seats_per_row,
    ts.id AS seat_id,
    ts.seat_number,
    ts.seat_label,
    ts.is_booked,
    ts.is_locked,
    ts.booking_id
FROM theatre_configurations tc
LEFT JOIN theatre_categories tcat ON tc.id = tcat.config_id
LEFT JOIN theatre_rows tr ON tcat.id = tr.category_id
LEFT JOIN theatre_seats ts ON tr.id = ts.row_id
ORDER BY tc.id, tr.row_number, ts.seat_number;

-- View: Seat availability summary per event
CREATE OR REPLACE VIEW v_seat_availability AS
SELECT 
    tc.event_id,
    tc.subtype,
    tcat.category_name,
    tcat.price,
    tcat.total_seats,
    tcat.available_seats,
    (tcat.total_seats - tcat.available_seats) AS booked_seats,
    ROUND((tcat.available_seats::DECIMAL / NULLIF(tcat.total_seats, 0)) * 100, 2) AS availability_percentage
FROM theatre_configurations tc
JOIN theatre_categories tcat ON tc.id = tcat.config_id
ORDER BY tc.event_id, tcat.price DESC;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE theatre_configurations IS 'Stores overall theatre configuration per event';
COMMENT ON TABLE theatre_categories IS 'Stores pricing categories (VIP, Gold, etc.) for each theatre';
COMMENT ON TABLE theatre_rows IS 'Stores row configuration and category assignment';
COMMENT ON TABLE theatre_seats IS 'Stores individual seat information and booking status';
COMMENT ON TABLE theatre_validation_rules IS 'Stores subtype-specific validation rules from spec';
COMMENT ON TABLE screenx_fixed_layout IS 'Fixed pyramid layout for ScreenX (cannot be modified)';

COMMENT ON COLUMN theatre_seats.locked_until IS 'Temporary lock timestamp during booking process (5-10 min hold)';
COMMENT ON COLUMN theatre_configurations.is_fixed_layout IS 'TRUE for ScreenX - admin cannot modify seat counts';
COMMENT ON COLUMN theatre_validation_rules.allowed_seats_per_row IS 'NULL = any count, or specific array like {4,8,12,16} for 4DX';
