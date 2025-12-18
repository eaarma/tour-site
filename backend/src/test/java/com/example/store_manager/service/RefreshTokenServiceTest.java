package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.example.store_manager.model.RefreshToken;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.RefreshTokenRepository;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService service;

    @Test
    void store_returnsOk_andSavesToken() {
        User user = new User();

        Result<Boolean> result = service.store(user, "token", Instant.now().plusSeconds(60));

        assertTrue(result.isOk());
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void validateAndGetUser_returnsOk_whenTokenValid() {
        User user = new User();

        RefreshToken rt = RefreshToken.builder()
                .token("token")
                .user(user)
                .expiresAt(Instant.now().plusSeconds(60))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenAndRevokedFalse("token"))
                .thenReturn(Optional.of(rt));

        Result<User> result = service.validateAndGetUser("token");

        assertTrue(result.isOk());
        assertSame(user, result.get());
    }

    @Test
    void validateAndGetUser_returnsFail_whenTokenNotFound() {
        when(refreshTokenRepository.findByTokenAndRevokedFalse("bad"))
                .thenReturn(Optional.empty());

        Result<User> result = service.validateAndGetUser("bad");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void validateAndGetUser_returnsFail_whenTokenExpired() {
        RefreshToken rt = RefreshToken.builder()
                .token("token")
                .user(new User())
                .expiresAt(Instant.now().minusSeconds(10))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenAndRevokedFalse("token"))
                .thenReturn(Optional.of(rt));

        Result<User> result = service.validateAndGetUser("token");

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        assertEquals("Refresh token expired", result.error().message());
    }

    @Test
    void revoke_returnsOk() {
        Result<Boolean> result = service.revoke("token");

        assertTrue(result.isOk());
        verify(refreshTokenRepository).revokeByToken("token");
    }

    @Test
    void revokeAllForUser_returnsOk() {
        User user = new User();

        Result<Boolean> result = service.revokeAllForUser(user);

        assertTrue(result.isOk());
        verify(refreshTokenRepository).revokeAllByUser(user);
    }
}
