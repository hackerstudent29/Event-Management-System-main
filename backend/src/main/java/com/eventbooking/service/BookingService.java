package com.eventbooking.service;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.Booking;

import com.eventbooking.model.User;
import com.eventbooking.repository.BookingRepository;

import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Objects;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.eventbooking.repository.EventCategoryRepository eventCategoryRepository;

    @Autowired
    private com.eventbooking.repository.SeatHoldRepository seatHoldRepository;

    @Transactional
    public Booking bookSeats(Dtos.BookingRequest request) {
        validateSeatAvailability(request.getEventCategoryId(), request.getSeatIds(), request.getUserId());
        // We now book by Category
        // Note: We need pessimistic lock on the CATEGORY row to ensure atomic seat
        // updates
        // JPA repo doesn't have default findByIdWithLock for category, we should add it
        // or use manual lock.
        // For MVP speed, we'll assume the repo needs 'findById' and handle concurrency
        // via versioning or simple check if single instance.
        // Better: add findByIdWithLock to EventCategoryRepository.

        com.eventbooking.model.EventCategory category = eventCategoryRepository
                .findById(Objects.requireNonNull(request.getEventCategoryId()))
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Pessimistic lock to ensure atomic updates to seat counts and prevent
        // overbooking
        com.eventbooking.model.EventCategory freshCat = eventCategoryRepository.findByIdWithLock(category.getId())
                .orElseThrow(() -> new RuntimeException("Category no longer exists"));

        // Reject bookings for past events
        if (freshCat.getEvent().getEventDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Booking closed. This event has already finished.");
        }

        // Reject bookings before opening time
        if (freshCat.getEvent().getBookingOpenDate() != null
                && freshCat.getEvent().getBookingOpenDate().isAfter(java.time.LocalDateTime.now())) {
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                    .ofPattern("dd MMM yyyy, hh:mm a");
            throw new RuntimeException(
                    "Booking for this event opens on " + freshCat.getEvent().getBookingOpenDate().format(formatter));
        }

        if (freshCat.getAvailableSeats() < request.getSeats()) {
            throw new RuntimeException(String.format(
                    "Not enough seats available in category '%s'. Requested: %d, Available: %d",
                    freshCat.getCategoryName(),
                    request.getSeats(),
                    freshCat.getAvailableSeats()));
        }

        // Enforce Ticket Limits per booking
        // Theatre: Max 10, Others: Max 5
        String eventType = freshCat.getEvent().getEventType();
        int maxTickets = "Theatre".equalsIgnoreCase(eventType) ? 10 : 5;
        if (request.getSeats() > maxTickets) {
            throw new RuntimeException("Ticket limit exceeded. You can only book up to " + maxTickets + " tickets for "
                    + (eventType != null ? eventType : "this event") + ".");
        }

        // Decrement seats
        freshCat.setAvailableSeats(freshCat.getAvailableSeats() - request.getSeats());
        eventCategoryRepository.save(freshCat);
        category = freshCat;

        User user = userRepository.findById(Objects.requireNonNull(request.getUserId(), "User ID required"))
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEventCategory(category);
        booking.setSeatsBooked(request.getSeats());
        booking.setSeatIdentifiers(request.getSeatIds() != null ? String.join(", ", request.getSeatIds()) : "");
        booking.setStatus("CONFIRMED");
        booking.setPaymentId(request.getPaymentId());
        booking.setRazorpayOrderId(request.getRazorpayOrderId());

        // Clear existing hold for this user before saving confirmed booking
        seatHoldRepository.deleteByUserIdAndEventCategoryId(user.getId(), category.getId());

        return bookingRepository.save(booking);
    }

    @Transactional
    public void holdSeats(Dtos.BookingRequest request) {
        validateSeatAvailability(request.getEventCategoryId(), request.getSeatIds(), request.getUserId());
        // Clear any previous holds by this user for this category
        seatHoldRepository.deleteByUserIdAndEventCategoryId(request.getUserId(), request.getEventCategoryId());

        com.eventbooking.model.SeatHold hold = new com.eventbooking.model.SeatHold();
        hold.setUserId(request.getUserId());
        hold.setEventCategoryId(request.getEventCategoryId());
        hold.setSeatIdentifiers(String.join(", ", request.getSeatIds()));
        com.eventbooking.model.EventCategory category = eventCategoryRepository
                .findById(Objects.requireNonNull(request.getEventCategoryId()))
                .orElseThrow(() -> new RuntimeException("Category not found"));
        if (category.getEvent().getEventDate().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Cannot hold seats for a past event.");
        }

        if (category.getEvent().getBookingOpenDate() != null
                && category.getEvent().getBookingOpenDate().isAfter(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Booking is not yet open.");
        }

        hold.setExpiresAt(java.time.LocalDateTime.now().plusSeconds(300)); // 5 minute hold
        seatHoldRepository.save(hold);

        // Periodic cleanup of expired holds - can be moved to a scheduler but for MVP
        // we run it here
        seatHoldRepository.deleteByExpiresAtBefore(java.time.LocalDateTime.now());
    }

    public List<Booking> getUserBookings(@org.springframework.lang.NonNull UUID userId) {
        return bookingRepository.findByUser_Id(userId);
    }

    @Autowired
    private com.eventbooking.repository.EventRepository eventRepository;

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Dtos.DashboardStats getDashboardStats() {
        long totalEvents = eventRepository.count();
        List<Booking> allBookings = bookingRepository.findAll();
        long totalBookings = allBookings.size();
        long totalSeatsSold = allBookings.stream()
                .mapToLong(Booking::getSeatsBooked)
                .sum();

        return new Dtos.DashboardStats(totalEvents, totalBookings, totalSeatsSold);
    }

    public void emailTicket(UUID bookingId) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        emailService.sendTicketEmail(booking.getUser().getEmail(), booking);
    }

    @Transactional
    public Dtos.ScanResponse scanTicket(UUID bookingId) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId)).orElse(null);
        if (booking == null) {
            return new Dtos.ScanResponse("INVALID", "Ticket not found in system.");
        }

        if ("CANCELLED".equals(booking.getStatus())) {
            return new Dtos.ScanResponse("CANCELLED", "This booking was cancelled and refunded.");
        }

        if (booking.isCheckedIn()) {
            return new Dtos.ScanResponse("ALREADY_USED", "Ticket was already scanned at " + booking.getCheckedInAt());
        }

        // Success - Check in
        booking.setCheckedIn(true);
        booking.setCheckedInAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);

        return new Dtos.ScanResponse(
                "VALID",
                "Entry allowed. Welcome!",
                booking.getEventCategory().getEvent().getName(),
                booking.getEventCategory().getCategoryName(),
                booking.getSeatsBooked(),
                booking.getUser().getName());
    }

    public Dtos.ScanResponse verifyTicket(UUID bookingId) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId)).orElse(null);
        if (booking == null) {
            return new Dtos.ScanResponse("INVALID", "Ticket not found.");
        }

        String status = booking.isCheckedIn() ? "ALREADY_USED" : "VALID";
        if ("CANCELLED".equals(booking.getStatus()))
            status = "CANCELLED";

        return new Dtos.ScanResponse(
                status,
                status.equals("VALID") ? "This is a valid ticket." : "Ticket status: " + status,
                booking.getEventCategory().getEvent().getName(),
                booking.getEventCategory().getCategoryName(),
                booking.getSeatsBooked(),
                booking.getUser().getName());
    }

    @Transactional
    public void resetCheckIn(UUID bookingId) {
        Booking booking = bookingRepository.findById(Objects.requireNonNull(bookingId))
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setCheckedIn(false);
        booking.setCheckedInAt(null);
        bookingRepository.save(booking);
    }

    public void validateSeatAvailability(UUID categoryId, java.util.List<String> requestedSeats, UUID currentUserId) {
        if (requestedSeats == null || requestedSeats.isEmpty())
            return;

        java.util.List<Booking> confirmed = bookingRepository.findByEventCategory_IdAndStatus(categoryId, "CONFIRMED");
        java.util.Set<String> taken = new java.util.HashSet<>();

        for (Booking b : confirmed) {
            String ids = b.getSeatIdentifiers();
            if (ids != null && !ids.isEmpty()) {
                String[] split = ids.split(", ");
                for (String s : split)
                    taken.add(s);
            }
        }

        java.util.List<com.eventbooking.model.SeatHold> holds = seatHoldRepository
                .findByEventCategoryIdAndExpiresAtAfter(categoryId, java.time.LocalDateTime.now());
        for (com.eventbooking.model.SeatHold h : holds) {
            if (!h.getUserId().equals(currentUserId)) {
                String ids = h.getSeatIdentifiers();
                if (ids != null && !ids.isEmpty()) {
                    String[] split = ids.split(", ");
                    for (String s : split)
                        taken.add(s);
                }
            }
        }

        for (String req : requestedSeats) {
            if (taken.contains(req)) {
                throw new RuntimeException("Seat " + req + " is no longer available.");
            }
        }
    }

    public java.util.List<String> getOccupiedSeats(UUID categoryId) {
        java.util.List<Booking> bookings = bookingRepository.findByEventCategory_IdAndStatus(categoryId, "CONFIRMED");
        java.util.List<String> occupied = new java.util.ArrayList<>();

        // Add confirmed seats
        for (Booking b : bookings) {
            String ids = b.getSeatIdentifiers();
            if (ids != null && !ids.isEmpty()) {
                String[] split = ids.split(", ");
                for (String s : split) {
                    occupied.add(s);
                }
            }
        }

        // Add currently held seats (not expired)
        java.util.List<com.eventbooking.model.SeatHold> holds = seatHoldRepository
                .findByEventCategoryIdAndExpiresAtAfter(categoryId, java.time.LocalDateTime.now());
        for (com.eventbooking.model.SeatHold h : holds) {
            String ids = h.getSeatIdentifiers();
            if (ids != null && !ids.isEmpty()) {
                String[] split = ids.split(", ");
                for (String s : split) {
                    if (!occupied.contains(s)) {
                        occupied.add(s);
                    }
                }
            }
        }

        return occupied;
    }

    @Autowired
    private EmailService emailService;
}
