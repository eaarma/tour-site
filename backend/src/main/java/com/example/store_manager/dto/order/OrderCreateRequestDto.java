package com.example.store_manager.dto.order;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreateRequestDto {

    @NotEmpty(message = "At least one item must be included in the order")
    private List<OrderItemCreateRequestDto> items;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    // Contact info copied into each item
    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @Pattern(regexp = "\\+?[0-9\\- ]{7,15}", message = "Invalid phone number")
    @NotBlank(message = "Phone number is required")
    private String phone;

    private String nationality; // optional
}