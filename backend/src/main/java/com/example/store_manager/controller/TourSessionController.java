package com.example.store_manager.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.service.TourSessionService;
import com.example.store_manager.utility.ResultResponseMapper;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class TourSessionController {

    private final TourSessionService service;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSessionsForAdmin(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ResultResponseMapper.toResponse(
                service.searchSessionsForAdmin(query, status, from, to, page, size));
    }

    // GET all sessions for a tour
    @GetMapping("/tour/{tourId}")
    public ResponseEntity<?> getByTour(
            @PathVariable("tourId") Long tourId) {
        return ResultResponseMapper.toResponse(service.getSessions(tourId));
    }

    // GET single session
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable("id") Long id) {
        return ResultResponseMapper.toResponse(service.getSession(id));
    }

    // Assign manager
    @PatchMapping("/{sessionId}/assign-manager")
    public ResponseEntity<?> assignManager(
            @PathVariable("sessionId") Long sessionId,
            @RequestParam(value = "managerId", required = false) UUID managerId) {
        return ResultResponseMapper.toResponse(
                service.assignManager(sessionId, managerId));
    }

    // Update status
    @PatchMapping("/{sessionId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable("sessionId") Long sessionId,
            @RequestParam("status") SessionStatus status) {
        return ResultResponseMapper.toResponse(
                service.updateStatus(sessionId, status));
    }

    // Sessions for shop
    @GetMapping("/shop/{shopId}")
    public ResponseEntity<?> getSessionsForShop(
            @PathVariable("shopId") Long shopId) {
        return ResultResponseMapper.toResponse(
                service.getSessionsForShop(shopId));
    }

    // Sessions for manager
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<?> getSessionsForManager(
            @PathVariable("managerId") UUID managerId) {
        return ResultResponseMapper.toResponse(
                service.getSessionsForManager(managerId));
    }

    @GetMapping("/shops/{shopId}/stats/tours-given")
    public ResponseEntity<Long> getToursGiven(@PathVariable("shopId") Long shopId) {
        long count = service.getCompletedSessionsCount(shopId);
        return ResponseEntity.ok(count);
    }
}
