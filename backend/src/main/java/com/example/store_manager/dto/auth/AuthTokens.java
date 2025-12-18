package com.example.store_manager.dto.auth;

import java.time.Instant;

public record AuthTokens(
        String accessToken,
        String refreshToken,
        Instant refreshExpiresAt) {
}