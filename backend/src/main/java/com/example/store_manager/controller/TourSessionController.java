package com.example.store_manager.controller;

import com.example.store_manager.dto.tourSession.TourSessionDto;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.service.TourSessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class TourSessionController {

    private final TourSessionService service;

    // GET all sessions for a tour
    @GetMapping("/tour/{tourId}")
    public List<TourSessionDto> getByTour(@PathVariable Long tourId) {
        return service.getSessions(tourId);
    }

    // GET single session (with participants)
    @GetMapping("/{id}")
    public TourSessionDto getById(@PathVariable Long id) {
        return service.getSession(id);
    }

    @PatchMapping("/{sessionId}/assign-manager")
    public TourSessionDto assignManager(
            @PathVariable Long sessionId,
            @RequestParam(required = false) UUID managerId) {
        return service.assignManager(sessionId, managerId);
    }

    @PatchMapping("/{sessionId}/status")
    public TourSessionDto updateStatus(
            @PathVariable Long sessionId,
            @RequestParam SessionStatus status) {
        return service.updateStatus(sessionId, status);
    }

    @GetMapping("/shop/{shopId}")
    public List<TourSessionDto> getSessionsForShop(@PathVariable Long shopId) {
        return service.getSessionsForShop(shopId);
    }

    @GetMapping("/manager/{managerId}")
    public List<TourSessionDto> getSessionsForManager(@PathVariable UUID managerId) {
        return service.getSessionsForManager(managerId);
    }

}
