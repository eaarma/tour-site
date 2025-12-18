package com.example.store_manager.controller;

import com.example.store_manager.dto.tourSession.TourSessionDto;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.service.TourSessionService;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> getByTour(@PathVariable Long tourId) {
        return ResultResponseMapper.toResponse(service.getSessions(tourId));
    }

    // GET single session
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResultResponseMapper.toResponse(service.getSession(id));
    }

    // Assign manager
    @PatchMapping("/{sessionId}/assign-manager")
    public ResponseEntity<?> assignManager(
            @PathVariable Long sessionId,
            @RequestParam(required = false) UUID managerId) {

        return ResultResponseMapper.toResponse(
                service.assignManager(sessionId, managerId));
    }

    // Update status
    @PatchMapping("/{sessionId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long sessionId,
            @RequestParam SessionStatus status) {

        return ResultResponseMapper.toResponse(
                service.updateStatus(sessionId, status));
    }

    // Sessions for shop
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getSessionsForShop(@PathVariable Long shopId) {
        return ResultResponseMapper.toResponse(
                service.getSessionsForShop(shopId));
    }

    // Sessions for manager
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getSessionsForManager(@PathVariable UUID managerId) {
        return ResultResponseMapper.toResponse(
                service.getSessionsForManager(managerId));
    }

}
