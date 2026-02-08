package com.example.store_manager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.store_manager.dto.reserve.ReserveRequestDto;
import com.example.store_manager.dto.reserve.ReserveResponseDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.User;
import com.example.store_manager.service.ReservationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final ReservationService reservationService;

    @PostMapping("/reserve")
    public ResponseEntity<ReserveResponseDto> reserve(
            @RequestBody ReserveRequestDto request,
            @AuthenticationPrincipal User user) {
        Order order = reservationService.reserve(request.getItems(), user);

        return ResponseEntity.ok(
                new ReserveResponseDto(
                        order.getId(),
                        order.getExpiresAt(),
                        order.getStatus()));
    }
}
