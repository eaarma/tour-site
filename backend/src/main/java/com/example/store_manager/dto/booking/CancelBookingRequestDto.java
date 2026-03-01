package com.example.store_manager.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CancelBookingRequestDto {
    @NotBlank
    private String token;

    private String reason;
}