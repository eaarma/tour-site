package com.tourhub.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import com.tourhub.payment.model.PaymentStatus;

public record PaymentDto(
        Long id,
        BigDecimal total,
        BigDecimal platformFee,
        BigDecimal shopAmount,
        String currency,
        PaymentStatus status,
        Instant createdAt) {
}
