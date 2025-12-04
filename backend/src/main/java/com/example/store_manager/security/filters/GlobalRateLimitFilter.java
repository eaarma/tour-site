package com.example.store_manager.security.filters;

import com.example.store_manager.security.CustomUserDetails;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class GlobalRateLimitFilter extends OncePerRequestFilter {

    // Cache of buckets
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(50, Duration.ofMinutes(1))) // 50 req/min
                .build());
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String key;

        // Determine user identity or fallback IP
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails user) {
            key = "USER_" + user.getId();
        } else {
            key = "IP_" + request.getRemoteAddr();
        }

        Bucket bucket;

        // 🎯 SPECIAL LIMITS FOR AUTH ENDPOINTS
        if (path.equals("/auth/login")) {
            bucket = cache.computeIfAbsent("LOGIN_" + key, k -> Bucket.builder()
                    .addLimit(Bandwidth.simple(5, Duration.ofMinutes(1))) // 5 attempts/min
                    .build());
        }

        else if (path.equals("/auth/register")) {
            bucket = cache.computeIfAbsent("REGISTER_" + key, k -> Bucket.builder()
                    .addLimit(Bandwidth.simple(3, Duration.ofMinutes(1))) // 3/min
                    .build());
        }

        // ⭐ DEFAULT LIMIT FOR EVERYTHING ELSE
        else {
            bucket = cache.computeIfAbsent("DEFAULT_" + key, k -> Bucket.builder()
                    .addLimit(Bandwidth.simple(50, Duration.ofMinutes(1))) // 50/min
                    .build());
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("text/plain");
            response.getWriter().write("Too many requests. Slow down.");
        }
    }

}
