package com.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_category_id", nullable = false)
    private EventCategory eventCategory;

    @Column(name = "seats_booked", nullable = false)
    private int seatsBooked;

    @Column(name = "seat_identifiers")
    private String seatIdentifiers;

    @Column(nullable = false)
    private String status; // CONFIRMED, CANCELLED

    @Column(name = "payment_id")
    private String paymentId;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "checked_in", nullable = false)
    private boolean checkedIn = false;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    @Column(name = "booking_time", updatable = false)
    private LocalDateTime bookingTime;

    @PrePersist
    protected void onCreate() {
        bookingTime = LocalDateTime.now();
    }
}
