package com.eventbooking.controller;

import com.eventbooking.model.User;
import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Collections;
import com.eventbooking.security.JwtUtil;
import com.eventbooking.dto.Dtos;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@RestController
@RequestMapping("/api/admin-check")
public class AdminCheckController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/verify")
    public String verify(@RequestParam String email, @RequestParam String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return "User not found: " + email;
        }
        User user = userOpt.get();
        String storedHash = user.getPassword();
        boolean matches = passwordEncoder.matches(password, storedHash);

        // Test Token Generation
        String tokenTest = "Failed";
        try {
            org.springframework.security.core.userdetails.UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                    user.getEmail(),
                    user.getPassword(),
                    java.util.Collections
                            .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                    "ROLE_" + user.getRole())));
            tokenTest = jwtUtil.generateToken(userDetails, user.getRole(), user.getId());
        } catch (Exception e) {
            tokenTest = "Error: " + e.getMessage();
            e.printStackTrace();
        }

        return "User found. ID: " + user.getId() +
                "\nMatches: " + matches +
                "\nVerified: " + user.isEmailVerified() +
                "\nRole: " + user.getRole() +
                "\nToken Test: " + (tokenTest.startsWith("Error") ? tokenTest : "SUCCESS");
    }

    @GetMapping("/force-login")
    public ResponseEntity<?> forceLogin(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body("User not found");

        User user = userOpt.get();
        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())));

        String jwt = jwtUtil.generateToken(userDetails, user.getRole(), user.getId());
        return ResponseEntity
                .ok(new Dtos.LoginResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found: " + email);
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully for " + email);
    }
}
