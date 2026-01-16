package com.eventbooking.config;

import com.eventbooking.model.User;
import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private javax.sql.DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("========================================");
        System.out.println("CRITICAL: DataInitializer STARTING...");

        try (java.sql.Connection conn = dataSource.getConnection();
                java.sql.Statement stmt = conn.createStatement()) {
            System.out.println("Executing Schema Fixes...");
            try {
                stmt.execute("ALTER TABLE events DROP COLUMN IF EXISTS available_seats");
                stmt.execute("ALTER TABLE events DROP COLUMN IF EXISTS total_seats");
                stmt.execute("ALTER TABLE bookings DROP COLUMN IF EXISTS event_id");
                System.out.println("SUCCESS: Dropped obsolete columns from 'events' and 'bookings' tables.");
            } catch (Exception e) {
                System.out.println("SCHEMA FIX WARNING: " + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Primary Admin
        createOrUpdateUser("admin@eventbooking.com", "ADMIN", "Admin@123");

        // Authorized Scanner User
        createOrUpdateUser("ramzendrum@gmail.com", "ADMIN", "Admin@123");

        // Backup Admin (Emergency Access)
        createOrUpdateUser("backup_admin@gmail.com", "ADMIN", "Admin@123");

        // Student/User
        createOrUpdateUser("cookwithcomali5@gmail.com", "USER", "User@123");

        // Force update this user's password every time
        forceUpdateUser("hackerstudent2007@gmail.com", "USER", "User@123");

        System.out.println("CRITICAL: DataInitializer COMPLETED");
        System.out.println("========================================");
    }

    private void createOrUpdateUser(String email, String role, String defaultPassword) {
        System.out.println("Checking user: " + email);
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> {
                    // User exists - DO NOT update password (this was causing login failures!)
                    System.out.println("✅ User " + email + " already exists - skipping");
                },
                () -> {
                    User newUser = new User();
                    newUser.setName(email.split("@")[0]);
                    newUser.setEmail(email);
                    newUser.setPassword(passwordEncoder.encode(defaultPassword));
                    newUser.setRole(role);
                    newUser.setEmailVerified(true);
                    userRepository.save(newUser);
                    System.out.println("✅ Created new " + role + " user: " + email);
                });
    }

    private void forceUpdateUser(String email, String role, String password) {
        System.out.println("Force updating: " + email);
        userRepository.findByEmail(email).ifPresentOrElse(
                user -> {
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole(role);
                    user.setEmailVerified(true);
                    userRepository.save(user);
                    System.out.println("✅ FORCE UPDATED password for " + email);
                },
                () -> {
                    User newUser = new User();
                    newUser.setName(email.split("@")[0]);
                    newUser.setEmail(email);
                    newUser.setPassword(passwordEncoder.encode(password));
                    newUser.setRole(role);
                    newUser.setEmailVerified(true);
                    userRepository.save(newUser);
                    System.out.println("✅ Created new user: " + email);
                });
    }
}
