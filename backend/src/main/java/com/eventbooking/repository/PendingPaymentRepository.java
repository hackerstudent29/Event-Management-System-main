package com.eventbooking.repository;

import com.eventbooking.model.PendingPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PendingPaymentRepository extends JpaRepository<PendingPayment, String> {
    void deleteByCreatedAtBefore(LocalDateTime expiry);
}
