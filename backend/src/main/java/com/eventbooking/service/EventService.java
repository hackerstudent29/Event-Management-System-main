package com.eventbooking.service;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.Event;
import com.eventbooking.repository.EventRepository;
import com.eventbooking.repository.EventCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.Objects;

@Service
@org.springframework.transaction.annotation.Transactional
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventCategoryRepository eventCategoryRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEvent(@org.springframework.lang.NonNull UUID id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event createEvent(Dtos.EventRequest request) {
        Event event = new Event();
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventDate(LocalDateTime.parse(request.getEventDate()));
        event.setEventType(request.getEventType());
        event.setLocationName(request.getLocationName());
        event.setLocationAddress(request.getLocationAddress());
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());
        // No global seat count

        Event savedEvent = eventRepository.save(event);

        // If categories provided, use them; otherwise initialize defaults
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            for (Dtos.CategoryRequest catReq : request.getCategories()) {
                com.eventbooking.model.EventCategory ec = new com.eventbooking.model.EventCategory();
                ec.setEvent(savedEvent);
                ec.setCategoryName(catReq.getCategoryName());
                ec.setColor(catReq.getColor());
                ec.setArenaPosition(catReq.getArenaPosition());
                ec.setTotalSeats(catReq.getTotalSeats());
                ec.setAvailableSeats(catReq.getAvailableSeats());
                ec.setPrice(catReq.getPrice());
                eventCategoryRepository.save(ec);
            }
        } else {
            initializeCategories(savedEvent);
        }

        return savedEvent;
    }

    private void initializeCategories(Event event) {
        String[][] categories = {
                { "General Admission", "#22C55E", "Rear" },
                { "Standard", "#3B82F6", "Middle" },
                { "Silver", "#9CA3AF", "Side" },
                { "Gold", "#FACC15", "Front Center" },
                { "Platinum", "#A855F7", "Stage Front" },
                { "Premium", "#6366F1", "Upper Level" },
                { "Elite", "#EF4444", "Private Box" },
                { "VIP", "#F97316", "VIP Lounge" },
                { "Front Row", "#14B8A6", "Row 1" },
                { "Balcony", "#64748B", "Balcony" }
        };

        for (String[] cat : categories) {
            com.eventbooking.model.EventCategory ec = new com.eventbooking.model.EventCategory();
            ec.setEvent(event);
            ec.setCategoryName(cat[0]);
            ec.setColor(cat[1]);
            ec.setArenaPosition(cat[2]);
            ec.setTotalSeats(100);
            ec.setAvailableSeats(100);
            ec.setPrice(new java.math.BigDecimal("500.00"));
            eventCategoryRepository.save(ec);
        }
    }

    public Event updateEvent(UUID id, Dtos.EventRequest request) {
        Event event = getEvent(Objects.requireNonNull(id));
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setEventDate(LocalDateTime.parse(request.getEventDate()));
        event.setEventType(request.getEventType());
        event.setLocationName(request.getLocationName());
        event.setLocationAddress(request.getLocationAddress());
        event.setLatitude(request.getLatitude());
        event.setLongitude(request.getLongitude());

        // Handle categories
        if (request.getCategories() != null) {
            // Mapping existing categories by name for easy lookup
            Map<String, com.eventbooking.model.EventCategory> existingMap = new HashMap<>();
            event.getCategories().forEach(c -> existingMap.put(c.getCategoryName(), c));

            List<com.eventbooking.model.EventCategory> updatedCategories = new ArrayList<>();

            for (Dtos.CategoryRequest catReq : request.getCategories()) {
                com.eventbooking.model.EventCategory ec = existingMap.get(catReq.getCategoryName());
                if (ec != null) {
                    // Update existing
                    int seatDelta = catReq.getTotalSeats() - ec.getTotalSeats();
                    ec.setTotalSeats(catReq.getTotalSeats());
                    ec.setAvailableSeats(ec.getAvailableSeats() + seatDelta);
                    ec.setPrice(catReq.getPrice());
                    ec.setArenaPosition(catReq.getArenaPosition());
                    ec.setColor(catReq.getColor());
                    updatedCategories.add(ec);
                    existingMap.remove(catReq.getCategoryName());
                } else {
                    // Create new
                    com.eventbooking.model.EventCategory newEc = new com.eventbooking.model.EventCategory();
                    newEc.setEvent(event);
                    newEc.setCategoryName(catReq.getCategoryName());
                    newEc.setColor(catReq.getColor());
                    newEc.setArenaPosition(catReq.getArenaPosition());
                    newEc.setTotalSeats(catReq.getTotalSeats());
                    newEc.setAvailableSeats(catReq.getTotalSeats());
                    newEc.setPrice(catReq.getPrice());
                    updatedCategories.add(newEc);
                }
            }

            // Categories not in the request: We keep them but set seats to 0 to disable
            // booking
            // instead of deleting them (which could fail due to bookings).
            existingMap.values().forEach(removed -> {
                removed.setTotalSeats(0);
                removed.setAvailableSeats(0);
                updatedCategories.add(removed);
            });

            // Update the collection
            event.getCategories().clear();
            event.getCategories().addAll(updatedCategories);
        }

        return eventRepository.save(event);
    }

    @Autowired
    private EmailService emailService;

    public void cancelEvent(@org.springframework.lang.NonNull UUID id, String reason) {
        Event event = getEvent(id);
        event.setCancelled(true);
        event.setCancellationReason(reason);
        eventRepository.save(event);

        // Update all related bookings to CANCELLED and send emails
        List<com.eventbooking.model.Booking> bookings = bookingRepository.findByEventCategory_Event_Id(id);
        for (com.eventbooking.model.Booking booking : bookings) {
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);

            // Send cancellation email to the user
            if (booking.getUser() != null && booking.getUser().getEmail() != null) {
                emailService.sendCancellationEmail(booking.getUser().getEmail(), booking, reason);
            }
        }
    }

    @Autowired
    private com.eventbooking.repository.BookingRepository bookingRepository;

    public void deleteEvent(@org.springframework.lang.NonNull UUID id) {
        getEvent(id);
        eventRepository.deleteById(id);
    }
}
