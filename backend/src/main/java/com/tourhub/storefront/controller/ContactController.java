package com.tourhub.storefront.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.common.email.EmailService;
import com.tourhub.storefront.dto.ContactRequestDto;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
@Slf4j
public class ContactController {

    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submit(@Valid @RequestBody ContactRequestDto request) {
        try {
            emailService.sendContactMessage(
                    request.getName(),
                    request.getEmail(),
                    request.getSubject(),
                    request.getMessage());

            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalStateException e) {
            log.error("Contact form configuration error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to forward contact form message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send message."));
        }
    }
}
