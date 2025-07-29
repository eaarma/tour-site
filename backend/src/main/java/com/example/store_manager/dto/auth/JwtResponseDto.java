package com.example.store_manager.dto.auth;

import com.example.store_manager.dto.user.UserResponseDto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponseDto {
    private String token;
    private String refreshToken;
    private UserResponseDto user;
}