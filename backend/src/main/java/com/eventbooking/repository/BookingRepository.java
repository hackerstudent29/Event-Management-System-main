package com.eventbooking.repository;

import com.eventbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByUser_Id(UUID userId);

    List<Booking> findByEventCategory_Event_Id(UUID eventId);

    List<Booking> findByEventCategory_IdAndStatus(UUID categoryId, String status);
}
