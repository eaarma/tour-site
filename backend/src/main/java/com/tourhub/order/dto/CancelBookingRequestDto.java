package com.tourhub.order.dto;

import com.tourhub.order.model.CancellationReasonType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelBookingRequestDto {

    @NotNull
    private CancellationReasonType reasonType;

    @Size(max = 500)
    private String reason;

    private String token; // for public endpoint
}
