package com.tourhub.payout.dto;

import java.time.LocalDate;

import com.tourhub.payout.model.PayoutMethod;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayoutCreateRequestDto {
    @NotNull
    private Long shopId;

    @NotNull
    private LocalDate periodStart;

    @NotNull
    private LocalDate periodEnd;

    @NotNull
    private PayoutMethod method;

    private String reference;
    private String notes;
    private String bankAccountName;
    private String bankAccountIban;
}
