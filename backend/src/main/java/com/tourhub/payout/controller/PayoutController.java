package com.tourhub.payout.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.payout.dto.PayoutCreateRequestDto;
import com.tourhub.payout.service.PayoutService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPayout(@Valid @RequestBody PayoutCreateRequestDto request) {
        return ResultResponseMapper.toResponse(payoutService.createPayout(request));
    }

    @GetMapping("/admin/shops")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminShopSummaries(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResultResponseMapper.toResponse(
                payoutService.getAdminShopSummaries(query, status, year, month, from, to));
    }

    @GetMapping("/admin/shops/{shopId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminShopDetails(
            @PathVariable("shopId") Long shopId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResultResponseMapper.toResponse(
                payoutService.getAdminShopDetails(shopId, status, year, month, from, to));
    }

    @GetMapping("/shops/{shopId}/sessions")
    public ResponseEntity<?> getManagerSessionSummaries(
            @PathVariable("shopId") Long shopId,
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "month", required = false) Integer month) {
        return ResultResponseMapper.toResponse(
                payoutService.getManagerSessionSummaries(shopId, query, status, year, month));
    }

    @GetMapping("/shops/{shopId}/sessions/details")
    public ResponseEntity<?> getManagerSessionDetails(
            @PathVariable("shopId") Long shopId,
            @RequestParam(name = "sessionId") Long sessionId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(name = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResultResponseMapper.toResponse(
                payoutService.getManagerSessionDetails(shopId, sessionId, status, from, to));
    }
}

