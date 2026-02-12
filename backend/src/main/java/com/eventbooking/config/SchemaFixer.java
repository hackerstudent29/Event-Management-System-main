package com.eventbooking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Running manual schema fixes...");
        try {
            // Add is_cancelled column if it doesn't exist
            jdbcTemplate
                    .execute("ALTER TABLE events ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT FALSE NOT NULL");
            System.out.println("Column 'is_cancelled' checked/added successfully.");

            // Add cancellation_reason column if it doesn't exist
            jdbcTemplate.execute("ALTER TABLE events ADD COLUMN IF NOT EXISTS cancellation_reason TEXT");
            System.out.println("Column 'cancellation_reason' checked/added successfully.");

            // FIX: Add check-in columns to bookings
            jdbcTemplate
                    .execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE NOT NULL");
            jdbcTemplate.execute("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP");
            // Persistence for bookings during payment
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS pending_payments (" +
                    "reference_id VARCHAR(255) PRIMARY KEY, " +
                    "booking_payload TEXT NOT NULL, " +
                    "created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");

            // Update seat_holds for payment tracking
            jdbcTemplate.execute("ALTER TABLE seat_holds ADD COLUMN IF NOT EXISTS reference_id VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE seat_holds ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'HELD'");

            System.out.println("Payment persistence schema updates applied successfully.");
        } catch (Exception e) {
            System.err.println("Error running schema fixes: " + e.getMessage());
        }
    }
}
