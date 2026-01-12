package com.eventbooking.controller;

import com.eventbooking.model.User;
import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin-setup")
public class AdminSetupController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/make-admin/{email}")
    public ResponseEntity<String> makeUserAdmin(@PathVariable String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole("ADMIN");
            userRepository.save(user);
            return ResponseEntity.ok("User " + email + " is now an ADMIN");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
