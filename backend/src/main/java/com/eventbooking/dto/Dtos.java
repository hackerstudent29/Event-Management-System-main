package com.eventbooking.dto;

import lombok.Data;
import java.util.UUID;

public class Dtos {

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class GoogleLoginRequest {
        private String token; // ID Token from frontend
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class BookingRequest {
        private UUID eventId; // Kept for reference or if needed, but category is key
        private UUID eventCategoryId;
        private UUID userId;
        private int seats;
        private java.util.List<String> seatIds;
        private String paymentId;
        private String razorpayOrderId;
    }

    @Data
    public static class EventRequest {
        private String name;
        private String description;
        private String eventDate; // ISO format
        private String bookingOpenDate; // ISO format
        private String eventType;
        private String locationName;
        private String locationAddress;
        private Double latitude;
        private Double longitude;
        private String imageUrl;
        private String imageAspectRatio;
        private String eventSubType;
        private String seatingLayoutVariant;
        private java.util.List<CategoryRequest> categories;
        // Total seats is no longer global
    }

    @Data
    public static class CategoryRequest {
        private String categoryName;
        private String color;
        private String arenaPosition;
        private int totalSeats;
        private int availableSeats;
        private java.math.BigDecimal price;
    }

    @Data
    public static class DashboardStats {
        private long totalEvents;
        private long totalBookings;
        private long totalSeatsSold;

        public DashboardStats(long totalEvents, long totalBookings, long totalSeatsSold) {
            this.totalEvents = totalEvents;
            this.totalBookings = totalBookings;
            this.totalSeatsSold = totalSeatsSold;
        }
    }

    @Data
    public static class CancellationRequest {
        private String reason;
    }

    @Data
    public static class LoginResponse {
        private String token;
        private UUID id;
        private String name;
        private String email;
        private String role;

        public LoginResponse(String token, UUID id, String name, String email, String role) {
            this.token = token;
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }
    }

    @Data
    public static class ScanRequest {
        private UUID bookingId;
    }

    @Data
    public static class ScanResponse {
        private String status; // VALID, ALREADY_USED, INVALID, CANCELLED
        private String message;
        private String eventName;
        private String categoryName;
        private int seats;
        private String userName;

        public ScanResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }

        public ScanResponse(String status, String message, String eventName, String categoryName, int seats,
                String userName) {
            this.status = status;
            this.message = message;
            this.eventName = eventName;
            this.categoryName = categoryName;
            this.seats = seats;
            this.userName = userName;
        }
    }

    @Data
    public static class UserPreferencesRequest {
        private Boolean bookingConfirmations;
        private Boolean eventReminders;
        private Boolean cancellationUpdates;
        private Boolean promotionalEmails;
    }

    @Data
    public static class UserPreferencesResponse {
        private Boolean bookingConfirmations;
        private Boolean eventReminders;
        private Boolean cancellationUpdates;
        private Boolean promotionalEmails;

        public UserPreferencesResponse(Boolean bookingConfirmations, Boolean eventReminders,
                Boolean cancellationUpdates, Boolean promotionalEmails) {
            this.bookingConfirmations = bookingConfirmations;
            this.eventReminders = eventReminders;
            this.cancellationUpdates = cancellationUpdates;
            this.promotionalEmails = promotionalEmails;
        }
    }

    @Data
    public static class OrderRequest {
        private double amount;
        private String currency; // INR
    }

    @Data
    public static class OrderResponse {
        private String id; // Razorpay Order ID
        private String currency;
        private double amount;
        private String status;
    }

    @Data
    public static class PaymentVerificationRequest {
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @Data
    public static class WalletVerificationRequest {
        private String merchantId;
        private String referenceId;
    }
}
