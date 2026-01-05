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
import com.example.store_manager.security.crypto.TokenHasher;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService service;

    /*
     * =====================================================
     * STORE
     * =====================================================
     */
    @Test
    void store_returnsOk_andSavesHashedToken() {
        User user = new User();
        String rawToken = "token";
        Instant expiresAt = Instant.now().plusSeconds(60);

        Result<Boolean> result = service.store(user, rawToken, expiresAt);

        assertTrue(result.isOk());

        verify(refreshTokenRepository).save(argThat(rt -> rt.getUser() == user &&
                rt.getTokenHash().equals(TokenHasher.sha256Hex(rawToken)) &&
                rt.getExpiresAt().equals(expiresAt) &&
                !rt.isRevoked()));
    }

    /*
     * =====================================================
     * VALIDATE
     * =====================================================
     */
    @Test
    void validateAndGetUser_returnsOk_whenTokenValid() {
        User user = new User();
        String rawToken = "token";

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHasher.sha256Hex(rawToken))
                .expiresAt(Instant.now().plusSeconds(60))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(rt.getTokenHash()))
                .thenReturn(Optional.of(rt));

        Result<User> result = service.validateAndGetUser(rawToken);

        assertTrue(result.isOk());
        assertSame(user, result.get());
    }

    @Test
    void validateAndGetUser_returnsFail_whenTokenNotFound() {
        String rawToken = "bad";

        when(refreshTokenRepository.findByTokenHash(TokenHasher.sha256Hex(rawToken)))
                .thenReturn(Optional.empty());

        Result<User> result = service.validateAndGetUser(rawToken);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void validateAndGetUser_returnsFail_whenTokenExpired() {
        String rawToken = "token";

        RefreshToken rt = RefreshToken.builder()
                .user(new User())
                .tokenHash(TokenHasher.sha256Hex(rawToken))
                .expiresAt(Instant.now().minusSeconds(10))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(rt.getTokenHash()))
                .thenReturn(Optional.of(rt));

        Result<User> result = service.validateAndGetUser(rawToken);

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
        assertEquals("Refresh token expired", result.error().message());

        verify(refreshTokenRepository)
                .revokeByTokenHash(rt.getTokenHash());
    }

    /*
     * =====================================================
     * REUSE DETECTION
     * =====================================================
     */
    @Test
    void validateAndGetUser_revokesAll_whenTokenReused() {
        String rawToken = "token";
        User user = new User();

        RefreshToken rt = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHasher.sha256Hex(rawToken))
                .expiresAt(Instant.now().plusSeconds(60))
                .revoked(true)
                .build();

        when(refreshTokenRepository.findByTokenHash(rt.getTokenHash()))
                .thenReturn(Optional.of(rt));

        Result<User> result = service.validateAndGetUser(rawToken);

        assertTrue(result.isFail());
        assertEquals("Refresh token reuse detected", result.error().message());

        verify(refreshTokenRepository).revokeAllByUser(user);
    }

    /*
     * =====================================================
     * REVOKE
     * =====================================================
     */
    @Test
    void revoke_returnsOk_andRevokesByHash() {
        String rawToken = "token";

        Result<Boolean> result = service.revoke(rawToken);

        assertTrue(result.isOk());
        verify(refreshTokenRepository)
                .revokeByTokenHash(TokenHasher.sha256Hex(rawToken));
    }

    @Test
    void revokeAllForUser_returnsOk() {
        User user = new User();

        Result<Boolean> result = service.revokeAllForUser(user);

        assertTrue(result.isOk());
        verify(refreshTokenRepository).revokeAllByUser(user);
    }
}
