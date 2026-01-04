package com.example.store_manager.dto.auth;

import com.example.store_manager.dto.user.UserResponseDto;

public record AuthResponseDto(
        String accessToken,
        UserResponseDto user) {
}
