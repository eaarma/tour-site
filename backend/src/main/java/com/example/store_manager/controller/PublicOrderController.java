package com.example.store_manager.controller;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.service.BookingAccessTokenService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

    private final BookingAccessTokenService tokenService;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    @GetMapping("/manage")
    public ResponseEntity<OrderResponseDto> getOrderByToken(
            @RequestParam String token) {

        String hash = tokenService.hash(token);

        Order order = orderRepository
                .findByCancellationTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Invalid or expired link"));

        // Expiry check
        if (order.getCancellationTokenExpiresAt() == null ||
                order.getCancellationTokenExpiresAt().isBefore(Instant.now())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Invalid or expired link");
        }

        OrderResponseDto dto = orderMapper.toDto(order);

        return ResponseEntity.ok(dto);
    }
}