package com.example.store_manager.dto.payout;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.example.store_manager.model.PayoutStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutShopDetailsDto {
    private Long shopId;
    private String shopName;
    private String bankAccountName;
    private String bankAccountIban;
    private String currency;
    private PayoutStatus payoutStatus;
    private Long payoutId;
    private BigDecimal payoutAmount;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate payoutPeriodStart;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate payoutPeriodEnd;
    private Instant paidAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate periodStart;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate periodEnd;
    private long transactionCount;
    private BigDecimal totalAmount;
    private List<PayoutHistoryEntryDto> payouts;
    private List<PayoutSessionGroupDto> sessionGroups;
}
