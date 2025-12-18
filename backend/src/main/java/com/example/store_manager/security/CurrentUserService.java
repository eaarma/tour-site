package com.example.store_manager.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;

@Component
public class CurrentUserService {

    public CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("User not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails details) {
            return details;
        }

        throw new AccessDeniedException("Invalid authentication principal");
    }

    public UUID getCurrentUserId() {
        return getCurrentUserDetails().getId();
    }

    public boolean hasRole(String role) {
        // Accept both "ADMIN" and "ROLE_ADMIN" safely
        String normalized = role.startsWith("ROLE_") ? role : "ROLE_" + role;

        return getCurrentUserDetails().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(normalized));
    }
}
