package com.tourhub.auth.service;

import java.time.Instant;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.user.model.User;
import com.tourhub.user.repository.UserRepository;
import com.tourhub.security.JwtService;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.tourhub.auth.dto.AuthTokens;
import com.tourhub.auth.dto.LoginRequestDto;
import com.tourhub.auth.model.RefreshToken;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public Result<AuthTokens> login(LoginRequestDto loginDto) {

        if (loginDto.getEmail() == null || loginDto.getPassword() == null) {
            return Result.fail(ApiError.badRequest("Email and password are required"));
        }

        String email = loginDto.getEmail().trim().toLowerCase();
        String password = loginDto.getPassword();

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return Result.fail(ApiError.badRequest("Invalid email format"));
        }

        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password));
        } catch (Exception e) {
            return Result.fail(ApiError.badRequest("Invalid email or password"));
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow();

        // 🔒 Email verification gate
        if (!user.isEmailVerified()) {
            return Result.fail(ApiError.forbidden("Please verify your email before logging in."));
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        refreshTokenService.store(
                user,
                refreshToken,
                jwtService.getRefreshExpiryInstant());

        return Result.ok(new AuthTokens(
                accessToken,
                refreshToken,
                jwtService.getRefreshExpiryInstant()));
    }

    @Transactional
    public Result<AuthTokens> refresh(String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            return Result.fail(ApiError.forbidden("Invalid refresh token"));
        }

        // Optional JWT structure validation (keeps garbage out)
        if (!jwtService.validateRefreshToken(refreshToken)) {
            return Result.fail(ApiError.forbidden("Invalid refresh token"));
        }

        // Always resolve from the database, even if the token is revoked.
        Result<RefreshToken> tokenResult = refreshTokenService.resolve(refreshToken);
        if (tokenResult.isFail()) {
            return Result.fail(tokenResult.error());
        }

        RefreshToken rt = tokenResult.get();
        User user = rt.getUser();

        // Detect refresh token reuse.
        if (rt.isRevoked()) {
            refreshTokenService.revokeAllForUser(user);
            return Result.fail(ApiError.forbidden("Refresh token reuse detected"));
        }

        if (rt.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenService.revoke(refreshToken); // mark expired token revoked
            return Result.fail(ApiError.forbidden("Refresh token expired"));
        }

        // Rotate the token by revoking the old one and creating a new one.
        refreshTokenService.revoke(refreshToken);

        String newAccess = jwtService.generateAccessToken(user);
        String newRefresh = jwtService.generateRefreshToken(user);

        refreshTokenService.store(
                user,
                newRefresh,
                jwtService.getRefreshExpiryInstant());

        return Result.ok(new AuthTokens(
                newAccess,
                newRefresh,
                jwtService.getRefreshExpiryInstant()));
    }

    @Transactional
    public Result<Boolean> logout(String refreshToken) {

        if (refreshToken != null && jwtService.validateRefreshToken(refreshToken)) {

            Result<User> userResult = refreshTokenService.validateAndGetUser(refreshToken);

            if (userResult.isOk()) {
                refreshTokenService.revokeAllForUser(userResult.get());
            }
        }

        return Result.ok(true);
    }

}


