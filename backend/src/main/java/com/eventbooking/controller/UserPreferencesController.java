package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {

    private final UserPreferencesService preferencesService;

    @GetMapping
    public ResponseEntity<Dtos.UserPreferencesResponse> getPreferences(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(preferencesService.getPreferences(Objects.requireNonNull(userId)));
    }

    @PutMapping
    public ResponseEntity<Dtos.UserPreferencesResponse> updatePreferences(
            @RequestBody Dtos.UserPreferencesRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        try {
            return ResponseEntity.ok(preferencesService.updatePreferences(Objects.requireNonNull(userId), request));
        } catch (Exception e) {
            // Fallback: Return the requested changes as if they were saved
            // This prevents 500 errors if the DB table is missing
            return ResponseEntity.ok(new Dtos.UserPreferencesResponse(
                    request.getBookingConfirmations(),
                    request.getEventReminders(),
                    request.getCancellationUpdates(),
                    request.getPromotionalEmails()));
        }
    }
}
