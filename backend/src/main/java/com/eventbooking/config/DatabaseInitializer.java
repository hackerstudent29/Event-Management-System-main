package com.eventbooking.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Checking database schema for missing columns...");

        try {
            // Add 'name' column if missing
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);");

            // Add other potentially missing columns
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;");

            // Also ensure profile_image, phone_number exist as they are in User.java
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(255);");

            System.out.println("Database schema check completed.");
        } catch (Exception e) {
            System.err.println("Database schema update failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
