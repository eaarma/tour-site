package com.example.store_manager.dto.payout;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutSessionGroupDto {
    private Long sessionId;
    private String sessionTitle;
    private LocalDateTime scheduledAt;
    private long transactionCount;
    private BigDecimal totalAmount;
    private List<PayoutLineRowDto> rows;
}
