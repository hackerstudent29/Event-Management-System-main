package com.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "seat_holds")
@Data
@NoArgsConstructor
public class SeatHold {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "event_category_id", nullable = false)
    private UUID eventCategoryId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "seat_identifiers", columnDefinition = "TEXT")
    private String seatIdentifiers;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
}
