package com.eventbooking.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_categories", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "event_id", "category_name" })
})
public class EventCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("categories")
    @ManyToOne(fetch = FetchType.EAGER) // Switch to EAGER to ensure event data is loaded for bookings
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(nullable = false)
    private String color;

    @Column(name = "arena_position", nullable = false)
    private String arenaPosition;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats;

    @Column(name = "available_seats", nullable = false)
    private int availableSeats;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "eventCategory", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private java.util.List<Booking> bookings = new java.util.ArrayList<>();

    // Getters and Setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getArenaPosition() {
        return arenaPosition;
    }

    public void setArenaPosition(String arenaPosition) {
        this.arenaPosition = arenaPosition;
    }

    public int getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
