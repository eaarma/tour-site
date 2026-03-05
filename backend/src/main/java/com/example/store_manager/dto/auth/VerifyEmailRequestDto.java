package com.example.store_manager.dto.auth;

import lombok.Data;

@Data
public class VerifyEmailRequestDto {
    private String token;
}