package com.example.store_manager.dto.cart;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutDetailsDto {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "\\+?[0-9. ()-]{7,25}", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Nationality is required")
    private String nationality;
}