package com.example.store_manager.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

@PostMapping
public ResponseEntity<OrderResponseDto> createOrder(
        @RequestBody @Valid OrderCreateRequestDto dto) {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    UUID userId = null;

    if (authentication != null && authentication.isAuthenticated()
            && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
        userId = userDetails.getId(); // Authenticated user
    }

    return ResponseEntity.ok(orderService.createOrder(dto, userId));
}

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderResponseDto> updateOrder(
            @PathVariable UUID id,
            @RequestBody @Valid OrderCreateRequestDto dto) {
        return ResponseEntity.ok(orderService.updateOrder(id, dto));
    }
}