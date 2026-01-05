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
import com.example.store_manager.model.RefreshToken;
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

                RefreshToken rt = RefreshToken.builder()
                                .user(user)
                                .tokenHash("token") // if you later hash tokens, this value doesn't matter in unit tests
                                .expiresAt(Instant.now().plusSeconds(60))
                                .revoked(false)
                                .build();

                when(jwtService.validateRefreshToken("token"))
                                .thenReturn(true);

                // ✅ NEW: service now uses resolve()
                when(refreshTokenService.resolve("token"))
                                .thenReturn(Result.ok(rt));

                when(jwtService.generateAccessToken(user))
                                .thenReturn("new-access");

                when(jwtService.generateRefreshToken(user))
                                .thenReturn("new-refresh");

                when(jwtService.getRefreshExpiryInstant())
                                .thenReturn(Instant.now().plusSeconds(3600));

                when(refreshTokenService.revoke("token"))
                                .thenReturn(Result.ok(true));

                when(refreshTokenService.store(eq(user), eq("new-refresh"), any()))
                                .thenReturn(Result.ok(true));

                Result<AuthTokens> result = authService.refresh("token");

                assertTrue(result.isOk());
                assertEquals("new-access", result.get().accessToken());
                assertEquals("new-refresh", result.get().refreshToken());

                verify(refreshTokenService).resolve("token");
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

                // ✅ NEW: service now uses resolve()
                when(refreshTokenService.resolve("token"))
                                .thenReturn(Result.fail(ApiError.forbidden("Invalid refresh token")));

                Result<AuthTokens> result = authService.refresh("token");

                assertTrue(result.isFail());
                assertEquals("FORBIDDEN", result.error().code());

                verify(refreshTokenService).resolve("token");
                verify(refreshTokenService, never()).revoke(any());
                verify(refreshTokenService, never()).store(any(), any(), any());
        }

        @Test
        void refresh_fails_andRevokesAll_whenRevokedTokenIsReused() {
                User user = new User();
                user.setId(UUID.randomUUID());

                RefreshToken rt = RefreshToken.builder()
                                .user(user)
                                .tokenHash("token")
                                .expiresAt(Instant.now().plusSeconds(60))
                                .revoked(true) // 🚨 already revoked
                                .build();

                when(jwtService.validateRefreshToken("token"))
                                .thenReturn(true);

                when(refreshTokenService.resolve("token"))
                                .thenReturn(Result.ok(rt));

                Result<AuthTokens> result = authService.refresh("token");

                assertTrue(result.isFail());
                assertEquals("FORBIDDEN", result.error().code());
                assertEquals("Refresh token reuse detected", result.error().message());

                // 🔥 This is the key assertion
                verify(refreshTokenService).revokeAllForUser(user);

                verify(refreshTokenService, never()).store(any(), any(), any());
        }

        @Test
        void refresh_fails_whenRefreshTokenExpired() {
                User user = new User();
                user.setId(UUID.randomUUID());

                RefreshToken rt = RefreshToken.builder()
                                .user(user)
                                .tokenHash("token")
                                .expiresAt(Instant.now().minusSeconds(5)) // ❌ expired
                                .revoked(false)
                                .build();

                when(jwtService.validateRefreshToken("token"))
                                .thenReturn(true);

                when(refreshTokenService.resolve("token"))
                                .thenReturn(Result.ok(rt));

                Result<AuthTokens> result = authService.refresh("token");

                assertTrue(result.isFail());
                assertEquals("FORBIDDEN", result.error().code());
                assertEquals("Refresh token expired", result.error().message());

                verify(refreshTokenService).revoke("token");
                verify(refreshTokenService, never()).store(any(), any(), any());
        }

        @Test
void refresh_detectsConcurrentReuse() {
    User user = new User();
    user.setId(UUID.randomUUID());

    RefreshToken validRt = RefreshToken.builder()
            .user(user)
            .tokenHash("token")
            .expiresAt(Instant.now().plusSeconds(60))
            .revoked(false)
            .build();

    RefreshToken revokedRt = RefreshToken.builder()
            .user(user)
            .tokenHash("token")
            .expiresAt(Instant.now().plusSeconds(60))
            .revoked(true)
            .build();

    when(jwtService.validateRefreshToken("token"))
            .thenReturn(true);

    // First call → token valid
    when(refreshTokenService.resolve("token"))
            .thenReturn(Result.ok(validRt))  // first call
            .thenReturn(Result.ok(revokedRt)); // second call

    when(jwtService.generateAccessToken(user))
            .thenReturn("access");

    when(jwtService.generateRefreshToken(user))
            .thenReturn("refresh");

    when(jwtService.getRefreshExpiryInstant())
            .thenReturn(Instant.now().plusSeconds(3600));

    when(refreshTokenService.revoke("token"))
            .thenReturn(Result.ok(true));

    when(refreshTokenService.store(any(), any(), any()))
            .thenReturn(Result.ok(true));

    // ✅ First refresh succeeds
    Result<AuthTokens> first = authService.refresh("token");
    assertTrue(first.isOk());

    // ❌ Second refresh triggers reuse detection
    Result<AuthTokens> second = authService.refresh("token");
    assertTrue(second.isFail());
    assertEquals("Refresh token reuse detected", second.error().message());

    verify(refreshTokenService).revokeAllForUser(user);
}


        @Test
        void logout_alwaysReturnsOk() {
                Result<Boolean> result = authService.logout(null);

                assertTrue(result.isOk());
                assertTrue(result.get());
        }
}
