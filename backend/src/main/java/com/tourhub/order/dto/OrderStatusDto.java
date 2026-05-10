package com.tourhub.order.dto;

import java.time.Instant;

import com.tourhub.order.model.OrderStatus;

public record OrderStatusDto(
        Long id,
        OrderStatus status,
        Instant expiresAt,
        long remainingSeconds) {
}
