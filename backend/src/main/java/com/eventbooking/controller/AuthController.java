package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.User;

import com.eventbooking.security.JwtUtil;
import com.eventbooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

        @Autowired
        private AuthService authService;

        @Autowired
        private JwtUtil jwtUtil;

        @PostMapping("/register")
        public ResponseEntity<User> register(@RequestBody Dtos.RegisterRequest request) {
                return ResponseEntity.ok(authService.register(request));
        }

        @Autowired
        private com.eventbooking.service.OtpService otpService;

        @PostMapping("/forgot-password")
        public ResponseEntity<String> forgotPassword(
                        @RequestBody com.eventbooking.dto.OtpDtos.ForgotPasswordRequest request) {
                try {
                        otpService.generateOtp(request.getEmail().trim());
                        return ResponseEntity.ok("OTP sent to your email");
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        @PostMapping("/verify-otp")
        public ResponseEntity<String> verifyOtp(@RequestBody com.eventbooking.dto.OtpDtos.VerifyOtpRequest request) {
                try {
                        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
                        if (isValid) {
                                return ResponseEntity.ok("OTP is valid");
                        } else {
                                return ResponseEntity.badRequest().body("Invalid or expired OTP");
                        }
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        @PostMapping("/verify-email")
        public ResponseEntity<String> verifyEmail(@RequestBody com.eventbooking.dto.OtpDtos.VerifyOtpRequest request) {
                try {
                        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), "SIGNUP");
                        if (isValid) {
                                otpService.verifyEmail(request.getEmail());
                                otpService.markOtpUsed(request.getEmail(), request.getOtp(), "SIGNUP");
                                return ResponseEntity.ok("Email verified successfully");
                        } else {
                                return ResponseEntity.badRequest().body("Invalid or expired OTP");
                        }
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        @PostMapping("/reset-password")
        public ResponseEntity<String> resetPassword(
                        @RequestBody com.eventbooking.dto.OtpDtos.ResetPasswordRequest request) {
                try {
                        otpService.resetPassword(request.getEmail(), request.getNewPassword());
                        return ResponseEntity.ok("Password reset successfully");
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                }
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody Dtos.LoginRequest request) {
                System.out.println("--------------------------------------------------");
                System.out.println("LOGIN ATTMEPT: " + request.getEmail());
                System.out.println("--------------------------------------------------");

                try {
                        // Use AuthService directly
                        User user = authService.login(request);
                        System.out.println("AuthService returned user: " + user.getEmail());

                        // Construct UserDetails
                        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                                        user.getEmail(),
                                        user.getPassword(),
                                        java.util.Collections.singletonList(
                                                        new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                        "ROLE_" + user.getRole())));

                        String jwt = jwtUtil.generateToken(userDetails, user.getRole(), user.getId());
                        System.out.println("JWT Generated successfully");

                        return ResponseEntity.ok(new Dtos.LoginResponse(jwt, user.getId(), user.getName(),
                                        user.getEmail(), user.getRole()));
                } catch (Exception e) {
                        System.out.println("LOGIN FAILED EXCEPTION: " + e.getMessage());
                        String msg = e.getMessage();
                        if (msg != null && msg.contains("Invalid credentials")) {
                                return ResponseEntity.status(401).body(java.util.Map.of("message", msg));
                        }
                        // For connection issues like "Could not open JPA EntityManager", return 500
                        return ResponseEntity.status(500)
                                        .body(java.util.Map.of("message", "Internal Server Error: " + msg));
                }
        }

        @PostMapping("/google")
        public ResponseEntity<Dtos.LoginResponse> googleLogin(@RequestBody Dtos.GoogleLoginRequest request) {
                // Verify token with Google using UserInfo endpoint (since we have an Access
                // Token)
                String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
                RestTemplate restTemplate = new RestTemplate();
                try {
                        HttpHeaders headers = new HttpHeaders();
                        String token = request.getToken();
                        if (token == null) {
                                throw new IllegalArgumentException("Google token is missing");
                        }
                        headers.setBearerAuth(token);
                        HttpEntity<String> entity = new HttpEntity<>("", headers);

                        ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<Map<String, Object>>() {
                        };

                        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                                        userInfoUrl,
                                        java.util.Objects.requireNonNull(HttpMethod.GET), entity, typeRef);

                        Map<String, Object> googleUser = response.getBody();
                        if (googleUser == null) {
                                throw new RuntimeException("Google User Info is null");
                        }

                        String email = (String) googleUser.get("email");
                        String name = (String) googleUser.get("name");

                        if (email == null) {
                                throw new RuntimeException("Email not found in Google User Info");
                        }

                        // Auto-register or login
                        User user = authService.loginWithGoogle(email, name);

                        // Generate JWT
                        UserDetails userDetails = new org.springframework.security.core.userdetails.User(
                                        user.getEmail(),
                                        user.getPassword(),
                                        java.util.Collections
                                                        .singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                                                        "ROLE_" + user.getRole())));

                        String jwt = jwtUtil.generateToken(userDetails, user.getRole(), user.getId());

                        return ResponseEntity
                                        .ok(new Dtos.LoginResponse(jwt, user.getId(), user.getName(), user.getEmail(),
                                                        user.getRole()));

                } catch (Exception e) {
                        e.printStackTrace();
                        return ResponseEntity.badRequest().build();
                }
        }
}
