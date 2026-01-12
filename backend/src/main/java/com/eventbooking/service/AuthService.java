package com.eventbooking.service;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.User;
import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.eventbooking.service.OtpService otpService;

    public User register(Dtos.RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setEmailVerified(false); // Explicit initialization
        User savedUser = userRepository.save(user);

        // Generate and Send Signup OTP
        otpService.generateOtp(savedUser.getEmail(), "SIGNUP");

        return savedUser;
    }

    public User login(Dtos.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            User user = userOpt.get();
            if (!user.isEmailVerified()) {
                throw new RuntimeException("Email not verified. Please verify your email to log in.");
            }
            return user;
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User loginWithGoogle(String email, String name) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setPassword(passwordEncoder.encode("GOOGLE_AUTH_DEFAULT_PASSWORD")); // Dummy password
            newUser.setRole("USER");
            newUser.setEmailVerified(true); // Google Login is implicitly verified
            return userRepository.save(newUser);
        });
    }
}
