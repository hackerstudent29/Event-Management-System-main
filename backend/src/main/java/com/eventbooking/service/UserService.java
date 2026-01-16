package com.eventbooking.service;

import com.eventbooking.model.Booking;
import com.eventbooking.model.User;
import com.eventbooking.model.UserLocation;
import com.eventbooking.repository.BookingRepository;
import com.eventbooking.repository.UserLocationRepository;
import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.Objects;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserLocationRepository userLocationRepository;

    @Autowired
    private com.eventbooking.service.OtpService otpService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public User getUser(UUID userId) {
        return userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public User updateProfile(UUID userId, String name, String phoneNumber, String profileImage) {
        User user = getUser(userId);
        user.setName(name);
        user.setPhoneNumber(phoneNumber);
        if (profileImage != null) {
            user.setProfileImage(profileImage);
        }
        return userRepository.save(user);
    }

    public void initiatePasswordChange(UUID userId) {
        User user = getUser(userId);
        otpService.generateOtp(user.getEmail(), "PASSWORD_CHANGE");
    }

    @Transactional
    public void confirmPasswordChange(UUID userId, String otp, String newPassword) {
        User user = getUser(userId);
        if (!otpService.verifyOtp(user.getEmail(), otp, "PASSWORD_CHANGE")) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        otpService.markOtpUsed(user.getEmail(), otp, "PASSWORD_CHANGE");
    }

    public Map<String, Object> getDashboardStats(UUID userId) {
        List<Booking> bookings = bookingRepository.findByUser_Id(userId);
        long totalBookings = bookings.size();
        long confirmed = bookings.stream().filter(b -> "CONFIRMED".equals(b.getStatus())).count();
        long cancelled = bookings.stream().filter(b -> "CANCELLED".equals(b.getStatus())).count();

        // Calculate total spent (including simulated convenience fee for consistency
        // with frontend)
        double totalSpent = bookings.stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .mapToDouble(b -> b.getEventCategory().getPrice()
                        .multiply(java.math.BigDecimal.valueOf(b.getSeatsBooked())).doubleValue() + 35.40)
                .sum();

        return Map.of(
                "totalBookings", totalBookings,
                "confirmedBookings", confirmed,
                "cancelledBookings", cancelled,
                "totalSpent", totalSpent);
    }

    @Transactional
    public UserLocation saveLocation(UUID userId, UserLocation location) {
        location.setUserId(userId);
        return userLocationRepository.save(location);
    }

    public List<UserLocation> getLocations(UUID userId) {
        return userLocationRepository.findByUserId(userId);
    }

    @Transactional
    public void deleteLocation(UUID locationId) {
        userLocationRepository.deleteById(Objects.requireNonNull(locationId));
    }

    @Transactional
    public void deleteAccount(UUID userId) {
        userRepository.deleteById(Objects.requireNonNull(userId));
    }
}
