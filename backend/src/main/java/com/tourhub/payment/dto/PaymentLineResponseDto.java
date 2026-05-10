package com.tourhub.payment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import com.tourhub.payment.model.PaymentLineType;
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
public class PaymentLineResponseDto {

    private Long id;

    private Long paymentId;
    private Long orderId;
    private Long orderItemId;

    private Long shopId;

    private String tourTitle;
    private LocalDateTime scheduledAt;
    private Integer participants;

    private PaymentLineType type;

    private Long sessionId;

    private BigDecimal grossAmount;
    private BigDecimal platformFee;
    private BigDecimal shopAmount;

    private String currency;
    private PaymentStatus status;

    private Instant createdAt;
}
