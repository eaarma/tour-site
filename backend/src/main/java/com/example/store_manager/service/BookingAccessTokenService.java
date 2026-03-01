package com.example.store_manager.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.store_manager.model.Order;
import com.example.store_manager.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingAccessTokenService {

    private static final int TOKEN_BYTES = 32; // 256-bit

    private final SecureRandom secureRandom = new SecureRandom();

    private final OrderRepository orderRepository;

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

    @Transactional(readOnly = true)
    public Order requireValidOrder(String rawToken) {

        String hash = hash(rawToken);

        Order order = orderRepository.findByCancellationTokenHash(hash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid link"));

        if (order.getCancellationTokenExpiresAt() == null ||
                order.getCancellationTokenExpiresAt().isBefore(Instant.now())) {

            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid link");
        }

        return order;
    }

    @Transactional
    public void consumeToken(Order order) {
        // Consume token after first successful destructive action.
        order.setCancellationTokenHash(null);
        order.setCancellationTokenExpiresAt(null);
    }

    public record GeneratedToken(String rawToken, String hash) {
    }
}