package com.eventbooking.repository;

import com.eventbooking.model.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, UUID> {
    Optional<EmailOtp> findByEmailAndOtpAndPurpose(String email, String otp, String purpose);

    void deleteByEmailAndPurpose(String email, String purpose);
}
