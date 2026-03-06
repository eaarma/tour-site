package com.example.store_manager.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import com.example.store_manager.utility.Result;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import com.example.store_manager.model.PasswordResetToken;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.PasswordResetTokenRepository;
import com.example.store_manager.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.store_manager.utility.ApiError;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private static final Duration TOKEN_VALIDITY = Duration.ofMinutes(30);

    @Transactional
    public Result<Void> requestPasswordReset(String email) {

        if (email == null || email.isBlank()) {
            return Result.fail(ApiError.badRequest("Email is required"));
        }

        String normalizedEmail = email.trim().toLowerCase();

        Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);

        // 🔒 SECURITY: never reveal whether email exists
        if (optionalUser.isEmpty()) {
            return Result.ok();
        }

        User user = optionalUser.get();

        // remove previous tokens
        tokenRepository.deleteByUserId(user.getId());

        String rawToken = UUID.randomUUID().toString();
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(tokenHash)
                .user(user)
                .expiresAt(Instant.now().plus(TOKEN_VALIDITY))
                .build();

        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user, rawToken);

        return Result.ok();
    }

    @Transactional
    public Result<Void> resetPassword(String token, String newPassword) {

        if (token == null || token.isBlank()) {
            return Result.fail(ApiError.badRequest("Token is required"));
        }

        if (newPassword == null || newPassword.length() < 6) {
            return Result.fail(ApiError.badRequest("Password must be at least 6 characters"));
        }

        String tokenHash = hashToken(token);

        PasswordResetToken resetToken = tokenRepository.findByToken(tokenHash)
                .orElse(null);

        if (resetToken == null) {
            return Result.fail(ApiError.badRequest("Invalid reset token"));
        }

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            tokenRepository.delete(resetToken);
            return Result.fail(ApiError.badRequest("Reset token expired"));
        }

        User user = resetToken.getUser();

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        tokenRepository.delete(resetToken);

        return Result.ok();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}