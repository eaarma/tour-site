package com.example.store_manager.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.auth.AuthTokens;
import com.example.store_manager.dto.user.LoginRequestDto;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
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

        if (refreshToken == null || !jwtService.validateRefreshToken(refreshToken)) {
            return Result.fail(ApiError.forbidden("Invalid refresh token"));
        }

        Result<User> userResult = refreshTokenService.validateAndGetUser(refreshToken);

        if (userResult.isFail()) {
            return Result.fail(userResult.error());
        }

        User user = userResult.get();

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
