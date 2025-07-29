package com.example.store_manager.dto.order;


import java.time.LocalDateTime;

import jakarta.validation.constraints.*;
import lombok.*;

import com.example.store_manager.dto.cart.CheckoutDetailsDto;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequestDto {

    @NotNull(message = "Tour ID must not be null")
    private Long tourId;

    @NotNull(message = "Number of participants is required")
    @Min(value = 1, message = "At least one participant is required")
    private Integer participants;

    @NotNull(message = "Tour date and time are required")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Checkout details are required")
    private CheckoutDetailsDto checkoutDetails;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}