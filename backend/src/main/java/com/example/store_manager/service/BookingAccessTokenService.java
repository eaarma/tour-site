package com.example.store_manager.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class BookingAccessTokenService {

    private static final int TOKEN_BYTES = 32; // 256-bit

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${security.booking-token.pepper}")
    private String pepper;

    public GeneratedToken generateToken() {

        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        String hash = hash(rawToken);

        return new GeneratedToken(rawToken, hash);
    }

    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((rawToken + pepper).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("Token hashing failed", e);
        }
    }

    public record GeneratedToken(String rawToken, String hash) {
    }
}