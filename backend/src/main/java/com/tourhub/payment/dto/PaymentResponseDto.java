package com.tourhub.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import com.tourhub.payment.model.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDto {

    private Long id;

    private Long orderId;

    private BigDecimal amountTotal;
    private BigDecimal platformFee;
    private BigDecimal shopAmount;

    private String currency;

    private PaymentStatus status;

    private Instant createdAt;
}
