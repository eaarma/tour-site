package com.example.store_manager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import com.example.store_manager.model.User;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration-ms:900000}") // default 15 min
    private long accessExpirationMs;

    @Value("${jwt.refresh-expiration-ms:604800000}") // default 7 days
    private long refreshExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ---------------------------------------------------
    // Helpers
    // ---------------------------------------------------

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✔️ REQUIRED (kept exactly as you asked)
    public String getUsernameFromToken(String token) {
        // Now returns the UUID string (subject)
        return parseClaims(token).getSubject();
    }

    public UUID getUserId(String token) {
        return UUID.fromString(parseClaims(token).getSubject());
    }

    public String getEmail(String token) {
        return parseClaims(token).get("email", String.class);
    }

    public String getRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public String getTokenType(String token) {
        return parseClaims(token).get("typ", String.class);
    }

    // ---------------------------------------------------
    // Access Token
    // ---------------------------------------------------

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("email", user.getEmail());
        claims.put("typ", "access");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId().toString()) // ✔️ UUID as subject
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);

            if (!"access".equals(claims.get("typ", String.class)))
                return false;

            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ---------------------------------------------------
    // Refresh Token
    // ---------------------------------------------------

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "refresh");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId().toString()) // ✔️ UUID as subject
                .setIssuedAt(new Date())
                .setId(UUID.randomUUID().toString())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);

            return "refresh".equals(claims.get("typ", String.class))
                    && claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Instant getRefreshExpiryInstant() {
        return Instant.ofEpochMilli(System.currentTimeMillis() + refreshExpirationMs);
    }
}