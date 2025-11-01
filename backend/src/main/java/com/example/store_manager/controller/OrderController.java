package com.example.store_manager.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.order.StatusUpdateRequestDto;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Create multi-item order
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

    // Get single order by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // Get all orders for authenticated user
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

    // Get all order items for a given shop (provider)
    @GetMapping("/shop/{shopId}/items")
    public ResponseEntity<List<OrderItemResponseDto>> getOrderItemsByShop(
            @PathVariable Long shopId) {
        return ResponseEntity.ok(orderService.getOrderItemsByShop(shopId));
    }

    @GetMapping("/items/{itemId}")
    public ResponseEntity<OrderItemResponseDto> getOrderItemById(@PathVariable Long itemId) {
        return ResponseEntity.ok(orderService.getOrderItemById(itemId));
    }

    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<OrderItemResponseDto> updateOrderItemStatus(
            @PathVariable Long itemId,
            @RequestBody StatusUpdateRequestDto request) {
        return ResponseEntity.ok(orderService.updateOrderItemStatus(itemId, request.getStatus()));
    }

    // Get order items by manager
    @GetMapping("/manager/{managerId}/items")
    public ResponseEntity<List<OrderItemResponseDto>> getOrderItemsByManager(
            @PathVariable UUID managerId) {
        return ResponseEntity.ok(orderService.getOrderItemsByManager(managerId));
    }

    // ✅ Confirm order item by manager and set status to CONFIRMED
    @PatchMapping("/items/{itemId}/confirm/{managerId}")
    public ResponseEntity<OrderItemResponseDto> confirmOrderItem(
            @PathVariable Long itemId,
            @PathVariable UUID managerId) {
        return ResponseEntity.ok(orderService.confirmOrderItem(itemId, managerId));
    }

    @PatchMapping("/items/{itemId}/assign")
    public ResponseEntity<OrderItemResponseDto> assignManagerToOrderItem(
            @PathVariable Long itemId,
            @RequestBody(required = false) Map<String, UUID> body) {

        UUID managerId = body != null ? body.get("managerId") : null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() ||
                !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID actingUserId = userDetails.getId();
        String actingUserRole = userDetails.getRole();

        return ResponseEntity.ok(
                orderService.assignManagerToOrderItem(itemId, managerId, actingUserId, actingUserRole));
    }

    @GetMapping("/user/{userId}/items")
    public ResponseEntity<List<OrderItemResponseDto>> getOrderItemsByUser(
            @PathVariable UUID userId) {

        return ResponseEntity.ok(orderService.getOrderItemsByUser(userId));
    }

}