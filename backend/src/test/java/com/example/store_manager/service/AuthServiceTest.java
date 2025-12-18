package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import com.example.store_manager.dto.auth.AuthTokens;
import com.example.store_manager.dto.user.LoginRequestDto;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_returnsOk_whenValidCredentials() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("test@example.com");
        dto.setPassword("password");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));
        when(jwtService.generateAccessToken(user))
                .thenReturn("access-token");
        when(jwtService.generateRefreshToken(user))
                .thenReturn("refresh-token");
        when(jwtService.getRefreshExpiryInstant())
                .thenReturn(Instant.now().plusSeconds(3600));

        Result<AuthTokens> result = authService.login(dto);

        assertTrue(result.isOk());
        assertEquals("access-token", result.get().accessToken());
        assertEquals("refresh-token", result.get().refreshToken());

        verify(refreshTokenService).store(
                eq(user),
                eq("refresh-token"),
                any(Instant.class));
    }

    @Test
    void login_returnsFail_whenEmailMissing() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setPassword("pw");

        Result<AuthTokens> result = authService.login(dto);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void login_returnsFail_whenInvalidEmailFormat() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("invalid");
        dto.setPassword("pw");

        Result<AuthTokens> result = authService.login(dto);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void login_returnsFail_whenAuthenticationFails() {
        LoginRequestDto dto = new LoginRequestDto();
        dto.setEmail("test@example.com");
        dto.setPassword("wrong");

        doThrow(new RuntimeException("bad creds"))
                .when(authManager)
                .authenticate(any());

        Result<AuthTokens> result = authService.login(dto);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
        assertEquals("Invalid email or password", result.error().message());
    }

    @Test
    void refresh_returnsOk_whenTokenValid() {
        User user = new User();
        user.setId(UUID.randomUUID());

        when(jwtService.validateRefreshToken("token"))
                .thenReturn(true);
        when(refreshTokenService.validateAndGetUser("token"))
                .thenReturn(Result.ok(user));
        when(jwtService.generateAccessToken(user))
                .thenReturn("new-access");
        when(jwtService.generateRefreshToken(user))
                .thenReturn("new-refresh");
        when(jwtService.getRefreshExpiryInstant())
                .thenReturn(Instant.now().plusSeconds(3600));

        Result<AuthTokens> result = authService.refresh("token");

        assertTrue(result.isOk());
        assertEquals("new-access", result.get().accessToken());
        assertEquals("new-refresh", result.get().refreshToken());

        verify(refreshTokenService).revoke("token");
        verify(refreshTokenService).store(eq(user), eq("new-refresh"), any());
    }

    @Test
    void refresh_returnsFail_whenRefreshTokenInvalid() {
        when(jwtService.validateRefreshToken("bad"))
                .thenReturn(false);

        Result<AuthTokens> result = authService.refresh("bad");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void refresh_returnsFail_whenRefreshTokenServiceFails() {
        when(jwtService.validateRefreshToken("token"))
                .thenReturn(true);
        when(refreshTokenService.validateAndGetUser("token"))
                .thenReturn(Result.fail(ApiError.forbidden("Invalid refresh token")));

        Result<AuthTokens> result = authService.refresh("token");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void logout_alwaysReturnsOk() {
        Result<Boolean> result = authService.logout(null);

        assertTrue(result.isOk());
        assertTrue(result.get());
    }
}
