package com.eventbooking.controller;

import com.eventbooking.model.User;
import com.eventbooking.model.UserLocation;
import com.eventbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile/{userId}")
    public ResponseEntity<User> getProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<User> updateProfile(
            @PathVariable UUID userId,
            @RequestBody Map<String, Object> updates) {

        Double lat = null;
        Double lng = null;
        if (updates.get("latitude") != null)
            lat = Double.valueOf(updates.get("latitude").toString());
        if (updates.get("longitude") != null)
            lng = Double.valueOf(updates.get("longitude").toString());

        return ResponseEntity.ok(userService.updateProfile(
                userId,
                (String) updates.get("name"),
                (String) updates.get("phoneNumber"),
                (String) updates.get("profileImage"),
                (String) updates.get("state"),
                (String) updates.get("district"),
                lat,
                lng));
    }

    @PostMapping("/profile/{userId}/password/otp")
    public ResponseEntity<Void> requestPasswordChangeOtp(@PathVariable UUID userId) {
        userService.initiatePasswordChange(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile/{userId}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> payload) {
        userService.confirmPasswordChange(
                userId,
                payload.get("otp"),
                payload.get("newPassword"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getDashboardStats(userId));
    }

    @GetMapping("/locations/{userId}")
    public ResponseEntity<List<UserLocation>> getLocations(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.getLocations(userId));
    }

    @PostMapping("/locations/{userId}")
    public ResponseEntity<UserLocation> saveLocation(
            @PathVariable UUID userId,
            @RequestBody UserLocation location) {
        return ResponseEntity.ok(userService.saveLocation(userId, location));
    }

    @DeleteMapping("/locations/{locationId}")
    public ResponseEntity<Void> deleteLocation(@PathVariable UUID locationId) {
        userService.deleteLocation(locationId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable UUID userId) {
        userService.deleteAccount(userId);
        return ResponseEntity.ok().build();
    }
}
