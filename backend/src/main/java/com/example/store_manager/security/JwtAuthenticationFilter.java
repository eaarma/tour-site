package com.example.store_manager.security;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String jwt = null;
        String username = null;

        // ---------------------------------------------------------
        // 1) Check Authorization header
        // ---------------------------------------------------------
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                if (jwtService.validateAccessToken(token)) {
                    jwt = token;
                    username = jwtService.getUsernameFromToken(jwt);
                }
            } catch (Exception ignored) {
                // Invalid token → ignore and continue unauthenticated
            }
        }

        // ---------------------------------------------------------
        // 2) Check cookie if no header token found
        // ---------------------------------------------------------
        if (jwt == null && request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    try {
                        if (jwtService.validateAccessToken(token)) {
                            jwt = token;
                            username = jwtService.getUsernameFromToken(jwt);
                        }
                    } catch (Exception ignored) {
                        // Ignore invalid token
                    }
                }
            }
        }

        // ---------------------------------------------------------
        // 3) Authenticate only if token was valid
        // ---------------------------------------------------------
        if (jwt != null && username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities());

            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}