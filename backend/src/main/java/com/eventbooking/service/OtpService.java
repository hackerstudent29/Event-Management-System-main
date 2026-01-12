package com.eventbooking.service;

import com.eventbooking.model.EmailOtp;
import com.eventbooking.model.User;
import com.eventbooking.repository.EmailOtpRepository;
import com.eventbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class OtpService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailOtpRepository emailOtpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Generate OTP for a generic purpose (SIGNUP, RESET)
    public void generateOtp(String email, String purpose) {
        // For RESET, user must exist. For SIGNUP, user might just be created or
        // pre-check.
        // But logic: register -> create user (unverified) -> generate OTP (SIGNUP).
        // forgot password -> check user -> generate OTP (RESET).

        if ("RESET".equals(purpose)) {
            userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        // Clean old OTPs for this email & purpose
        emailOtpRepository.deleteByEmailAndPurpose(email, purpose); // Requires @Transactional or specialized handling?
        // Let's just save a new one. Actually, delete old ones is good hygiene.
        // Need @Transactional on the method or repo method.
        // For simplicity, just saving new one. We can find latest by created_at if
        // multiple exist, or just use findByEmailAndOtp.

        EmailOtp emailOtp = new EmailOtp();
        emailOtp.setEmail(email);
        emailOtp.setOtp(otp);
        emailOtp.setPurpose(purpose);
        emailOtp.setExpiresAt(LocalDateTime.now().plusMinutes(5));

        emailOtpRepository.save(emailOtp);

        emailService.sendHtmlOtp(email, otp, purpose);
    }

    // Overload for backward compatibility / existing calls in AuthController for
    // forgot-password
    public void generateOtp(String email) {
        generateOtp(email, "RESET");
    }

    public boolean verifyOtp(String email, String otp, String purpose) {
        Optional<EmailOtp> otpOpt = emailOtpRepository.findByEmailAndOtpAndPurpose(email, otp, purpose);

        if (otpOpt.isEmpty()) {
            return false;
        }

        EmailOtp emailOtp = otpOpt.get();
        if (LocalDateTime.now().isAfter(emailOtp.getExpiresAt())) {
            return false;
        }

        // OTP is valid.
        return true;
    }

    // Overload for backward compat
    public boolean verifyOtp(String email, String otp) {
        // Try RESET first as that was the old default, or check both?
        // Existing AuthController verify-otp endpoint uses this.
        // Ideally we should pass purpose from frontend.
        // For now, let's assume RESET if not specified, OR generic verification.
        // Let's assume RESET for backward compatibility with existing "Verify OTP" page
        // which is for Forgot Password.
        return verifyOtp(email, otp, "RESET");
    }

    public void markOtpUsed(String email, String otp, String purpose) {
        Optional<EmailOtp> otpOpt = emailOtpRepository.findByEmailAndOtpAndPurpose(email, otp, purpose);
        otpOpt.ifPresent(emailOtpRepository::delete);
    }

    public void resetPassword(String email, String newPassword) {
        // This method assumes OTP was verified in previous step (frontend flow).
        // But strictly, we should verifying OTP again here or use a token.
        // For this simple flow, we trust the caller (AuthController) which should
        // likely require OTP + Password in one payload?
        // Looking at AuthController.resetPassword, it takes
        // OTPSDtos.ResetPasswordRequest which has email and newPassword?
        // Wait, AuthController logic: verifyOtp -> returns "Valid" -> User sees Reset
        // Page -> Enters Password -> calls resetPassword.
        // This is INSECURE if we don't verify OTP again or use a token.
        // User asked to fix Signup Flow specifically.
        // I will keep this existing logic but ensure Signup verification works.

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void verifyEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }
}
