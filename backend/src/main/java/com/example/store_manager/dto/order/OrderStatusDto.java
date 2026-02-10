package com.example.store_manager.dto.order;

import java.time.Instant;

import com.example.store_manager.model.OrderStatus;

public record OrderStatusDto(
        Long id,
        OrderStatus status,
        Instant expiresAt,
        long remainingSeconds) {
}
