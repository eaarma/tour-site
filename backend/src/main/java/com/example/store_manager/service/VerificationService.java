package com.example.store_manager.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import com.example.store_manager.model.EmailVerificationToken;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.EmailVerificationTokenRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ApiError;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;

    private static final Duration TOKEN_EXPIRATION = Duration.ofHours(24);

    @Transactional
    public String createVerificationToken(User user) {

        tokenRepository.findByUserId(user.getId())
                .ifPresent(existing -> tokenRepository.delete(existing));

        String token = UUID.randomUUID().toString();

        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiresAt(Instant.now().plus(TOKEN_EXPIRATION))
                .used(false)
                .build();

        tokenRepository.save(verificationToken);

        return token;
    }

    @Transactional
    public Result<Void> verifyEmail(String token) {

        EmailVerificationToken verificationToken = tokenRepository.findByToken(token).orElse(null);

        if (verificationToken == null) {
            return Result.fail(ApiError.badRequest("Invalid verification token"));
        }

        if (verificationToken.isUsed()) {
            return Result.fail(ApiError.badRequest("Token already used"));
        }

        if (verificationToken.getExpiresAt().isBefore(Instant.now())) {
            return Result.fail(ApiError.badRequest("Verification token expired"));
        }

        User user = verificationToken.getUser();

        user.setEmailVerified(true);
        verificationToken.setUsed(true);

        userRepository.save(user);
        tokenRepository.save(verificationToken);

        return Result.ok();
    }
}