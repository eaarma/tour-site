package com.example.store_manager.service;

import java.time.Instant;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.example.store_manager.model.RefreshToken;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.RefreshTokenRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public Result<Boolean> store(User user, String token, Instant expiresAt) {

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        refreshTokenRepository.save(rt);
        return Result.ok(true);
    }

    @Transactional(readOnly = true)
    public Result<User> validateAndGetUser(String token) {

        RefreshToken rt = refreshTokenRepository
                .findByTokenAndRevokedFalse(token)
                .orElse(null);

        if (rt == null) {
            return Result.fail(ApiError.forbidden("Invalid refresh token"));
        }

        if (rt.getExpiresAt().isBefore(Instant.now())) {
            return Result.fail(ApiError.forbidden("Refresh token expired"));
        }

        return Result.ok(rt.getUser());
    }

    @Transactional
    public Result<Boolean> revoke(String token) {
        refreshTokenRepository.revokeByToken(token);
        return Result.ok(true);
    }

    @Transactional
    public Result<Boolean> revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user);
        return Result.ok(true);
    }
}
