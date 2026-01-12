package com.eventbooking.controller;

import com.eventbooking.dto.Dtos;
import com.eventbooking.model.Event;
import com.eventbooking.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
import java.util.Objects;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEvent(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.getEvent(Objects.requireNonNull(id)));
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Dtos.EventRequest request) {
        System.out.println("Received Create Event Request: " + request.getName());
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable UUID id, @RequestBody Dtos.EventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(Objects.requireNonNull(id), request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelEvent(@PathVariable UUID id, @RequestBody Dtos.CancellationRequest request) {
        eventService.cancelEvent(Objects.requireNonNull(id), request.getReason());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(Objects.requireNonNull(id));
        return ResponseEntity.noContent().build();
    }
}
