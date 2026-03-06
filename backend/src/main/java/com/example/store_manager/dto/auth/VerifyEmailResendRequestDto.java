package com.example.store_manager.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyEmailResendRequestDto {

    @NotBlank
    @Email
    private String email;

}