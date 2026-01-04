package com.example.store_manager.service;

import java.time.Instant;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.auth.AuthTokens;
import com.example.store_manager.dto.user.LoginRequestDto;
import com.example.store_manager.model.RefreshToken;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

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
                .orElseThrow(); // logically impossible if auth succeeded

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

        // ✅ MUST resolve from DB even if revoked (reuse detection)
        Result<RefreshToken> tokenResult = refreshTokenService.resolve(refreshToken);
        if (tokenResult.isFail()) {
            return Result.fail(tokenResult.error());
        }

        RefreshToken rt = tokenResult.get();
        User user = rt.getUser();

        // ✅ REUSE DETECTION
        if (rt.isRevoked()) {
            refreshTokenService.revokeAllForUser(user);
            return Result.fail(ApiError.forbidden("Refresh token reuse detected"));
        }

        if (rt.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenService.revoke(refreshToken); // mark expired token revoked
            return Result.fail(ApiError.forbidden("Refresh token expired"));
        }

        // ✅ ROTATE: revoke old, create new
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
