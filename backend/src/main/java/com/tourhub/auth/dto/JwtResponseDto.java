package com.tourhub.auth.dto;

import com.tourhub.user.dto.UserResponseDto;

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
