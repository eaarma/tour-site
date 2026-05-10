package com.tourhub.payout.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tourhub.payout.model.PayoutStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutShopSummaryDto {
    private Long shopId;
    private String shopName;
    private String bankAccountName;
    private String bankAccountIban;
    private String currency;
    private PayoutStatus status;
    private PayoutStatus payoutStatus;
    private Long payoutId;
    private BigDecimal payoutAmount;
    private Instant paidAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate payoutPeriodStart;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate payoutPeriodEnd;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate periodStart;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate periodEnd;
    private long transactionCount;
    private BigDecimal totalAmount;
}
