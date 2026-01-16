package com.example.store_manager.security.filters;

import com.example.store_manager.security.CustomUserDetails;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class GlobalRateLimitFilter extends OncePerRequestFilter {

    private final MeterRegistry meterRegistry;

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    /* -------------------- Bucket factory -------------------- */

    private Bucket newBucket(long capacityPerMinute) {
        return Bucket.builder()
                .addLimit(Bandwidth.simple(capacityPerMinute, Duration.ofMinutes(1)))
                .build();
    }

    /* -------------------- Micrometer counters -------------------- */

    private Counter allowedCounter(String scope) {
        return Counter.builder("rate_limit_requests_allowed_total")
                .tag("application", "store_manager")
                .tag("scope", scope)
                .register(meterRegistry);
    }

    private Counter rejectedCounter(String scope) {
        return Counter.builder("rate_limit_requests_rejected_total")
                .tag("application", "store_manager")
                .tag("scope", scope)
                .register(meterRegistry);
    }

    /* -------------------- Filter logic -------------------- */

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String key;
        String scope;

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails user) {
            key = "USER_" + user.getId();
        } else {
            key = "IP_" + request.getRemoteAddr();
        }

        Bucket bucket;

        if (path.equals("/auth/login")) {
            scope = "login";
            bucket = cache.computeIfAbsent(
                    "LOGIN_" + key,
                    k -> newBucket(5)
            );
        } else if (path.equals("/auth/register")) {
            scope = "register";
            bucket = cache.computeIfAbsent(
                    "REGISTER_" + key,
                    k -> newBucket(3)
            );
        } else {
            scope = "default";
            bucket = cache.computeIfAbsent(
                    "DEFAULT_" + key,
                    k -> newBucket(50)
            );
        }

        if (bucket.tryConsume(1)) {
            allowedCounter(scope).increment();
            filterChain.doFilter(request, response);
        } else {
            rejectedCounter(scope).increment();
            response.setStatus(429);
            response.setContentType("text/plain");
            response.getWriter().write("Too many requests. Slow down.");
        }
    }
}
