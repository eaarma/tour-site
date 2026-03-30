package com.example.store_manager.dto.payout;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

import com.example.store_manager.model.PaymentLineType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutLineRowDto {
    private Long paymentLineId;
    private String label;
    private PaymentLineType type;
    private Long orderId;
    private Long orderItemId;
    private Long sessionId;
    private String tourTitle;
    private LocalDateTime scheduledAt;
    private Integer participants;
    private BigDecimal grossAmount;
    private BigDecimal platformFee;
    private BigDecimal shopAmount;
    private String currency;
    private Instant createdAt;
}
