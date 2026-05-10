package com.tourhub.payout.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tourhub.payout.model.PayoutMethod;
import com.tourhub.payout.model.PayoutStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutHistoryEntryDto {
    private Long id;
    private BigDecimal totalAmount;
    private Integer transactionCount;
    private String currency;
    private PayoutStatus status;
    private PayoutMethod method;
    private String reference;
    private Instant paidAt;
    private Instant createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate periodStart;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate periodEnd;
}
