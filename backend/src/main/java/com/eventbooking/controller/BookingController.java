package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.Booking;
import com.eventbooking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private com.eventbooking.repository.UserRepository userRepository;

    @Autowired
    private com.eventbooking.security.JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Booking> bookSeats(@RequestBody Dtos.BookingRequest request) {
        return ResponseEntity.ok(bookingService.bookSeats(request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        System.out.println("[BOOKING /my] Endpoint called");

        try {
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                System.out.println("[BOOKING /my] ERROR: Not authenticated");
                return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
            }

            String email = authentication.getName();
            System.out.println("[BOOKING /my] User email from context: " + email);

            com.eventbooking.model.User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            List<Booking> bookings = bookingService.getUserBookings(Objects.requireNonNull(user.getId()));
            System.out.println("[BOOKING /my] Returning " + bookings.size() + " bookings");

            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            System.out.println("[BOOKING /my] ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        // Admin only in real app
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/stats")
    public ResponseEntity<Dtos.DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(bookingService.getDashboardStats());
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Booking Controller Reachable");
    }

    @PostMapping("/{id}/email-ticket")
    public ResponseEntity<Void> emailTicket(@PathVariable java.util.UUID id) {
        System.out.println("[BOOKING] Email ticket request for: " + id);
        bookingService.emailTicket(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/scan")
    public ResponseEntity<Dtos.ScanResponse> scanTicket(@RequestBody Dtos.ScanRequest request) {
        return ResponseEntity.ok(bookingService.scanTicket(request.getBookingId()));
    }

    @GetMapping("/{id}/verify")
    public ResponseEntity<Dtos.ScanResponse> verifyTicket(@PathVariable java.util.UUID id) {
        return ResponseEntity.ok(bookingService.verifyTicket(id));
    }

    @PostMapping("/{id}/reset-checkin")
    public ResponseEntity<Void> resetCheckIn(@PathVariable java.util.UUID id) {
        bookingService.resetCheckIn(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/occupied/{categoryId}")
    public ResponseEntity<List<String>> getOccupiedSeats(@PathVariable java.util.UUID categoryId) {
        return ResponseEntity.ok(bookingService.getOccupiedSeats(categoryId));
    }

    @PostMapping("/hold")
    public ResponseEntity<Void> holdSeats(@RequestBody Dtos.BookingRequest request) {
        bookingService.holdSeats(request);
        return ResponseEntity.ok().build();
    }
}
