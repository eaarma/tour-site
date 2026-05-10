package com.tourhub.auth.dto;

import com.tourhub.user.dto.UserResponseDto;

public record AuthResponseDto(
        String accessToken,
        UserResponseDto user) {
}
