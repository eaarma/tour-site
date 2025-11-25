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

import com.example.store_manager.model.User;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    // Short-lived access token (default 15 minutes)
    @Value("${jwt.access-expiration-ms:900000}")
    private long accessExpirationMs;

    // Longer-lived refresh token (default 7 days)
    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    private Key key;

    @PostConstruct
    public void init() {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ---------- Helpers ----------

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getUsernameFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public String getTokenType(String token) {
        return parseClaims(token).get("typ", String.class);
    }

    // ---------- Access token ----------

    public String generateAccessToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("typ", "access");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Optional overload if you still want the Authentication version:
    public String generateAccessToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
        User user = userPrincipal.getUser(); // or look up by email
        return generateAccessToken(user);
    }

    public boolean validateAccessToken(String token) {
        try {
            Claims claims = parseClaims(token);

            // Must be access token
            if (!"access".equals(claims.get("typ", String.class))) {
                return false;
            }

            // Must NOT be expired
            return claims.getExpiration().after(new Date());

        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ---------- Refresh token ----------

    public String generateRefreshToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("typ", "refresh");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256) // ✅ new style
                .compact();
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = parseClaims(token);
            if (!"refresh".equals(claims.get("typ", String.class))) {
                return false;
            }
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public Instant getRefreshExpiryInstant() {
        return Instant.ofEpochMilli(System.currentTimeMillis() + refreshExpirationMs);
    }
}