package com.eventbooking.repository;

import com.eventbooking.model.SeatHold;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SeatHoldRepository extends JpaRepository<SeatHold, UUID> {
    List<SeatHold> findByEventCategoryIdAndExpiresAtAfter(UUID categoryId, LocalDateTime now);

    List<SeatHold> findByReferenceId(String referenceId);

    void deleteByExpiresAtBefore(LocalDateTime now);

    void deleteByUserIdAndEventCategoryId(UUID userId, UUID categoryId);

    void deleteByReferenceId(String referenceId);
}
