package com.eventbooking.repository;

import com.eventbooking.model.EventCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategory, UUID> {
    List<EventCategory> findByEventId(UUID eventId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT c FROM EventCategory c WHERE c.id = :id")
    java.util.Optional<EventCategory> findByIdWithLock(@org.springframework.data.repository.query.Param("id") UUID id);
}
