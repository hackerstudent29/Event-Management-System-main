package com.eventbooking.controller;

import com.eventbooking.model.Booking;
import com.eventbooking.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

/**
 * Admin utility controller for database maintenance tasks
 */
@RestController
@RequestMapping("/api/admin/maintenance")
public class MaintenanceController {

    @Autowired
    private BookingRepository bookingRepository;

    /**
     * Populate booking_time for existing bookings that don't have it
     * This is a one-time migration endpoint
     */
    @PostMapping("/populate-booking-times")
    public ResponseEntity<Map<String, Object>> populateBookingTimes() {
        try {
            List<Booking> allBookings = bookingRepository.findAll();

            int updatedCount = 0;
            LocalDateTime baseTime = LocalDateTime.of(2026, 1, 1, 10, 0, 0);

            // Sort by ID to maintain consistent order
            allBookings.sort((a, b) -> a.getId().compareTo(b.getId()));

            for (int i = 0; i < allBookings.size(); i++) {
                Booking booking = allBookings.get(i);

                // Only update if booking_time is null
                if (booking.getBookingTime() == null) {
                    // Set booking time with 1 minute increment for each booking
                    booking.setBookingTime(baseTime.plusMinutes(i));
                    bookingRepository.save(booking);
                    updatedCount++;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("totalBookings", allBookings.size());
            response.put("updatedBookings", updatedCount);
            response.put("message", "Successfully populated booking times for " + updatedCount + " bookings");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Check booking times status
     */
    @GetMapping("/check-booking-times")
    public ResponseEntity<Map<String, Object>> checkBookingTimes() {
        List<Booking> allBookings = bookingRepository.findAll();

        long nullCount = allBookings.stream()
                .filter(b -> b.getBookingTime() == null)
                .count();

        long populatedCount = allBookings.size() - nullCount;

        Map<String, Object> response = new HashMap<>();
        response.put("totalBookings", allBookings.size());
        response.put("withBookingTime", populatedCount);
        response.put("withoutBookingTime", nullCount);
        response.put("needsMigration", nullCount > 0);

        return ResponseEntity.ok(response);
    }
}
