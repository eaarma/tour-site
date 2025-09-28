package com.example.store_manager.controller;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.service.OrderService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 1️⃣ Create multi-item order
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(
            @RequestBody @Valid OrderCreateRequestDto dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        UUID userId = null;
        if (auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof com.example.store_manager.security.CustomUserDetails userDetails) {
            userId = userDetails.getId();
        }

        return ResponseEntity.ok(orderService.createOrder(dto, userId));
    }

    // 2️⃣ Get single order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // 3️⃣ Get all orders for authenticated user
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getUserOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = null;
        if (auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof com.example.store_manager.security.CustomUserDetails userDetails) {
            userId = userDetails.getId();
        }

        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // 4️⃣ Get all order items for a given shop (provider)
    @GetMapping("/shop/{shopId}/items")
    public ResponseEntity<List<OrderItemResponseDto>> getOrderItemsByShop(
            @PathVariable Long shopId) {
        return ResponseEntity.ok(orderService.getOrderItemsByShop(shopId));
    }

}