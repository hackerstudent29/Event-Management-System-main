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
@CrossOrigin(origins = { "http://localhost:3000", "https://zendrumbooking.vercel.app" })
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
        return ResponseEntity.ok(preferencesService.updatePreferences(Objects.requireNonNull(userId), request));
    }
}
