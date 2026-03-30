package com.example.store_manager.dto.payout;

import java.time.LocalDate;

import com.example.store_manager.model.PayoutMethod;

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
