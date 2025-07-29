package com.example.store_manager.dto.user;


import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRegisterRequestDto {

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "\\+?[0-9. ()-]{7,25}", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Experience field is required")
    private String experience;

    @NotBlank(message = "Languages field is required")
    private String languages;

    @NotBlank(message = "Bio is required")
    @Size(min = 10, message = "Bio must be at least 10 characters")
    private String bio;
}