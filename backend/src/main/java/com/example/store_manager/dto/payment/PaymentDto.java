package com.example.store_manager.dto.payment;

import java.math.BigDecimal;
import java.time.Instant;
import com.example.store_manager.model.PaymentStatus;

public record PaymentDto(
        Long id,
        BigDecimal total,
        BigDecimal platformFee,
        BigDecimal shopAmount,
        String currency,
        PaymentStatus status,
        Instant createdAt) {
}
