package com.eventbooking.repository;

import com.eventbooking.model.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface UserLocationRepository extends JpaRepository<UserLocation, UUID> {
    List<UserLocation> findByUserId(UUID userId);
}
