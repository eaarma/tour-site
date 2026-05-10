package com.tourhub.auth.dto;

import java.time.Instant;

public record AuthTokens(
        String accessToken,
        String refreshToken,
        Instant refreshExpiresAt) {
}
