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
            System.out.println("Check-in columns added to 'bookings' table successfully.");

        } catch (Exception e) {
            System.err.println("Error running schema fixes: " + e.getMessage());
        }
    }
}
