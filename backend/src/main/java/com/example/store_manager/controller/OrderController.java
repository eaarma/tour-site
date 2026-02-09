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

import com.example.store_manager.dto.finalize.FinalizeReservationDto;
import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.order.StatusUpdateRequestDto;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.service.OrderService;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Create multi-item order
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody @Valid OrderCreateRequestDto dto) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        UUID userId = null;
        if (auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            userId = userDetails.getId();
        }

        return ResultResponseMapper.toResponse(
                orderService.createOrder(dto, userId));
    }

    // Get single order by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable("id") Long id) {
        return ResultResponseMapper.toResponse(
                orderService.getOrderById(id));
    }

    // Guest-safe order view
    @GetMapping("/guest/{id}")
    public ResponseEntity<?> getGuestOrder(@PathVariable("id") Long id) {

        Result<OrderResponseDto> result = orderService.getOrderById(id);

        if (result.isFail()) {
            return ResultResponseMapper.toResponse(result);
        }

        OrderResponseDto order = result.get();

        // Remove sensitive fields
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                item.setEmail(null);
                item.setPhone(null);
                // item.setName(null);
                // item.setNationality(null);
            });
        }

        return ResponseEntity.ok(order);
    }

    // Get all orders for authenticated user
    @GetMapping
    public ResponseEntity<?> getUserOrders() {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = null;

        if (auth != null
                && auth.isAuthenticated()
                && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            userId = userDetails.getId();
        }

        return ResultResponseMapper.toResponse(
                orderService.getOrdersByUser(userId));
    }

    // Get all order items for a given shop (provider)
    @GetMapping("/shop/{shopId}/items")
    public ResponseEntity<?> getOrderItemsByShop(@PathVariable("shopId") Long shopId) {
        return ResultResponseMapper.toResponse(
                orderService.getOrderItemsByShop(shopId));
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<?> getOrderItem(@PathVariable("id") Long id) {
        return ResultResponseMapper.toResponse(
                orderService.getOrderItemById(id));
    }

    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<?> updateOrderItemStatus(
            @PathVariable Long itemId,
            @RequestBody StatusUpdateRequestDto request) {

        return ResultResponseMapper.toResponse(
                orderService.updateOrderItemStatus(itemId, request.getStatus()));
    }

    // Get order items by manager
    @GetMapping("/manager/{managerId}/items")
    public ResponseEntity<?> getOrderItemsByManager(
            @PathVariable("managerId") UUID managerId) {

        return ResultResponseMapper.toResponse(
                orderService.getOrderItemsByManager(managerId));
    }

    // ✅ Confirm order item by manager and set status to CONFIRMED
    @PatchMapping("/items/{itemId}/confirm/{managerId}")
    public ResponseEntity<?> confirmOrderItem(
            @PathVariable("itemId") Long itemId,
            @PathVariable("managerId") UUID managerId) {

        return ResultResponseMapper.toResponse(
                orderService.confirmOrderItem(itemId, managerId));
    }

    @PatchMapping("/items/{itemId}/assign")
    public ResponseEntity<?> assignManagerToOrderItem(
            @PathVariable("itemId") Long itemId,
            @RequestBody(required = false) Map<String, UUID> body) {

        UUID managerId = body != null ? body.get("managerId") : null;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() ||
                !(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UUID actingUserId = userDetails.getId();
        String actingUserRole = userDetails.getRole();

        return ResultResponseMapper.toResponse(
                orderService.assignManagerToOrderItem(
                        itemId,
                        managerId,
                        actingUserId,
                        actingUserRole));
    }

    @GetMapping("/user/{userId}/items")
    public ResponseEntity<?> getOrderItemsByUser(@PathVariable("userId") UUID userId) {
        return ResultResponseMapper.toResponse(
                orderService.getOrderItemsByUser(userId));
    }

    // 🔹 Guest checkout (no authentication)
    @PostMapping("/guest")
    public ResponseEntity<?> createGuestOrder(
            @RequestBody @Valid OrderCreateRequestDto dto) {

        // userId = null → guest order
        return ResultResponseMapper.toResponse(
                orderService.createOrder(dto, null));
    }

}