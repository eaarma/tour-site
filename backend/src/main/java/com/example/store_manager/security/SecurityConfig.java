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
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())).csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()

                        .requestMatchers("/error").permitAll()
                        // Anyone can view tours
                        .requestMatchers(HttpMethod.GET, "/tours").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tours/**").permitAll()
                        // Only MANAGER can create, update tours
                        .requestMatchers(HttpMethod.POST, "/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/tours/**").hasRole("MANAGER")

                        // Allow guests to create orders
                        .requestMatchers(HttpMethod.POST, "/orders/**").permitAll()

                        // Only MANAGER or managers can modify/delete orders
                        .requestMatchers(HttpMethod.PUT, "/orders/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasRole("MANAGER")

                        .requestMatchers(HttpMethod.POST, "/shops/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/shop-users/**").permitAll()

                        .requestMatchers(HttpMethod.PUT, "/shops/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/shop-users/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://127.0.0.1:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        config.setExposedHeaders(List.of("Authorization")); // so frontend can read token if returned
        config.setExposedHeaders(List.of(HttpHeaders.SET_COOKIE));

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

    // Test
    @PostConstruct
    public void init() {
        System.out.println(">> JwtAuthenticationFilter injected: " + (jwtAuthFilter != null));
    }

}