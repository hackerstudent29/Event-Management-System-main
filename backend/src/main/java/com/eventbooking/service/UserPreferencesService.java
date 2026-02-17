package com.eventbooking.service;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.User;
import com.eventbooking.model.UserPreferences;
import com.eventbooking.repository.UserPreferencesRepository;
import com.eventbooking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPreferencesService {

        private final UserPreferencesRepository preferencesRepository;
        private final UserRepository userRepository;

        @Transactional(readOnly = true)
        public Dtos.UserPreferencesResponse getPreferences(@NonNull UUID userId) {
                UserPreferences prefs = preferencesRepository.findByUserId(userId)
                                .orElseGet(() -> createDefaultPreferences(userId));

                return new Dtos.UserPreferencesResponse(
                                prefs.getBookingConfirmations(),
                                prefs.getEventReminders(),
                                prefs.getCancellationUpdates(),
                                prefs.getPromotionalEmails());
        }

        @Transactional
        public Dtos.UserPreferencesResponse updatePreferences(@NonNull UUID userId,
                        Dtos.UserPreferencesRequest request) {
                UserPreferences prefs = preferencesRepository.findByUserId(userId)
                                .orElseGet(() -> createDefaultPreferences(userId));

                prefs.setBookingConfirmations(request.getBookingConfirmations());
                prefs.setEventReminders(request.getEventReminders());
                prefs.setCancellationUpdates(request.getCancellationUpdates());
                prefs.setPromotionalEmails(request.getPromotionalEmails());

                UserPreferences saved = preferencesRepository.save(prefs);

                return new Dtos.UserPreferencesResponse(
                                saved.getBookingConfirmations(),
                                saved.getEventReminders(),
                                saved.getCancellationUpdates(),
                                saved.getPromotionalEmails());
        }

        private UserPreferences createDefaultPreferences(@NonNull UUID userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                try {
                        UserPreferences prefs = new UserPreferences();
                        prefs.setUser(user);
                        prefs.setBookingConfirmations(true);
                        prefs.setEventReminders(true);
                        prefs.setCancellationUpdates(true);
                        prefs.setPromotionalEmails(true);

                        return preferencesRepository.save(prefs);
                } catch (Exception e) {
                        // Fallback if DB save fails (e.g. table missing)
                        // Return a transient object so the frontend doesn't crash
                        UserPreferences fallback = new UserPreferences();
                        fallback.setBookingConfirmations(true);
                        fallback.setEventReminders(true);
                        fallback.setCancellationUpdates(true);
                        fallback.setPromotionalEmails(true);
                        return fallback;
                }
        }
}
