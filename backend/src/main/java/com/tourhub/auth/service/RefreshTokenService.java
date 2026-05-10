package com.tourhub.auth.service;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.user.model.User;
import com.tourhub.security.crypto.TokenHasher;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.auth.model.RefreshToken;
import com.tourhub.auth.repository.RefreshTokenRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    /*
     * =====================================================
     * STORE (login / refresh rotation)
     * =====================================================
     */
    @Transactional
    public Result<Boolean> store(User user, String rawToken, Instant expiresAt) {

        String tokenHash = TokenHasher.sha256Hex(rawToken);

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .revoked(false)
                .build();

        refreshTokenRepository.save(rt);
        return Result.ok(true);
    }

    /*
     * =====================================================
     * VALIDATE + REUSE DETECTION
     * =====================================================
     */
    @Transactional
    public Result<User> validateAndGetUser(String rawToken) {

        String tokenHash = TokenHasher.sha256Hex(rawToken);

        RefreshToken rt = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElse(null);

        if (rt == null) {
            return Result.fail(ApiError.forbidden("Invalid refresh token"));
        }

        // 🚨 REUSE DETECTED → revoke everything
        if (rt.isRevoked()) {
            refreshTokenRepository.revokeAllByUser(rt.getUser());
            return Result.fail(ApiError.forbidden("Refresh token reuse detected"));
        }

        if (rt.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.revokeByTokenHash(tokenHash);
            return Result.fail(ApiError.forbidden("Refresh token expired"));
        }

        return Result.ok(rt.getUser());
    }

    /*
     * =====================================================
     * REVOKE SINGLE TOKEN
     * =====================================================
     */
    @Transactional
    public Result<Boolean> revoke(String rawToken) {
        refreshTokenRepository.revokeByTokenHash(
                TokenHasher.sha256Hex(rawToken));
        return Result.ok(true);
    }

    /*
     * =====================================================
     * REVOKE ALL TOKENS (logout everywhere)
     * =====================================================
     */
    @Transactional
    public Result<Boolean> revokeAllForUser(User user) {
        refreshTokenRepository.revokeAllByUser(user);
        return Result.ok(true);
    }

    /*
     * =====================================================
     * RESOLVE (optional helper)
     * =====================================================
     */
    @Transactional(readOnly = true)
    public Result<RefreshToken> resolve(String rawToken) {

        RefreshToken rt = refreshTokenRepository
                .findByTokenHash(TokenHasher.sha256Hex(rawToken))
                .orElse(null);

        if (rt == null) {
            return Result.fail(ApiError.forbidden("Invalid refresh token"));
        }

        return Result.ok(rt);
    }
}


