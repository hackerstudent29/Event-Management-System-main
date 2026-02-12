package com.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pending_payments")
@Data
@NoArgsConstructor
public class PendingPayment {
    @Id
    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "booking_payload", columnDefinition = "TEXT")
    private String bookingPayload; // JSON string of List<BookingRequest>

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public PendingPayment(String referenceId, String bookingPayload) {
        this.referenceId = referenceId;
        this.bookingPayload = bookingPayload;
        this.createdAt = LocalDateTime.now();
    }
}
