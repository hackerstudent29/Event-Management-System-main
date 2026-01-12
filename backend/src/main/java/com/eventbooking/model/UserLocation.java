package com.eventbooking.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "user_locations")
@Data
@NoArgsConstructor
public class UserLocation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String label; // Home, Work, Hostel

    @Column(nullable = false)
    private String address;

    private Double latitude;
    private Double longitude;
}
