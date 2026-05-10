package com.tourhub.session.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tourhub.security.CustomUserDetails;
import com.tourhub.session.service.SessionCancellationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/manager/sessions")
@RequiredArgsConstructor
public class SessionManagementController {

    private final SessionCancellationService sessionCancellationService;

    @PostMapping("/{sessionId}/cancel")
    public ResponseEntity<?> cancelSession(
            @PathVariable("sessionId") Long sessionId,
            Authentication auth) {

        if (!(auth.getPrincipal() instanceof CustomUserDetails user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        sessionCancellationService.cancelSessionByGuide(
                sessionId,
                user.getId());

        return ResponseEntity.ok().build();
    }
}
