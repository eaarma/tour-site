package com.example.store_manager.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.store_manager.security.filters.GlobalRateLimitFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final GlobalRateLimitFilter globalRateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // Tours
                        .requestMatchers(HttpMethod.GET, "/tours").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tours/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/tours/**").hasRole("MANAGER")

                        // Orders
                        .requestMatchers(HttpMethod.GET, "/orders/guest/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/orders/guest").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN", "USER")
                        .requestMatchers(HttpMethod.PUT, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")

                        // Order items
                        .requestMatchers(HttpMethod.PATCH, "/orders/items/**")
                        .hasAnyRole("MANAGER", "OWNER", "ADMIN")

                        // Shops & Shop Users
                        .requestMatchers(HttpMethod.POST, "/shops/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/shop-users/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/shops/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/shop-users/**").authenticated()

                        // Tour Schedules
                        .requestMatchers(HttpMethod.GET, "/schedules/**").permitAll() // anyone can view
                        .requestMatchers(HttpMethod.POST, "/schedules/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/schedules/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/schedules/**").hasRole("MANAGER")

                        // Tour Sessions
                        .requestMatchers(HttpMethod.GET, "/sessions/**").permitAll() // anyone can view
                        .requestMatchers(HttpMethod.POST, "/sessions/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/sessions/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/sessions/**").hasRole("MANAGER")

                        // All other requests require authentication
                        .anyRequest().authenticated())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(globalRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                        }))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://127.0.0.1:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Cookie"));
        config.setExposedHeaders(List.of("Authorization", HttpHeaders.SET_COOKIE));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}