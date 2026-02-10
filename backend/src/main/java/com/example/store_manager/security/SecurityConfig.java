package com.example.store_manager.security;

import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.NullSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import com.example.store_manager.security.filters.GlobalRateLimitFilter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@EnableConfigurationProperties(RefreshSecurityProperties.class)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final GlobalRateLimitFilter globalRateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, HandlerMappingIntrospector introspector)
            throws Exception {

        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .securityContext(sc -> sc.securityContextRepository(securityContextRepository()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())

                .securityContext(security -> security
                        .requireExplicitSave(false))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/auth/me").authenticated()

                        // Tours
                        .requestMatchers(HttpMethod.GET, "/tours").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tours/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/tours/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/tours/**").hasRole("MANAGER")

                        // Orders
                        .requestMatchers(HttpMethod.GET, "/orders/guest/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/orders/guest").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/*/status").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN", "USER")
                        .requestMatchers(HttpMethod.POST, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN", "USER")
                        .requestMatchers(HttpMethod.PUT, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")

                        // Order items
                        .requestMatchers(HttpMethod.PATCH, "/orders/items/**").hasAnyRole("MANAGER", "OWNER", "ADMIN")

                        // Checkout
                        .requestMatchers(HttpMethod.POST, "/checkout/reserve").permitAll()
                        .requestMatchers(HttpMethod.POST, "/checkout/finalize").permitAll()

                        // Shops & Shop Users
                        .requestMatchers(HttpMethod.POST, "/api/shops/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/shop-users/**").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/shops/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/shop-users/**").authenticated()

                        // Tour Schedules
                        .requestMatchers(HttpMethod.GET, "/schedules/**").permitAll() // anyone can view
                        .requestMatchers(HttpMethod.POST, "/schedules/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/schedules/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/schedules/**").hasRole("MANAGER")

                        // Tour Images
                        .requestMatchers(HttpMethod.GET, "/tourimages/**").permitAll() // anyone can view
                        .requestMatchers(HttpMethod.POST, "/tourimages/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/tourimages/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/tourimages/**").hasRole("MANAGER")

                        // Tour Sessions
                        .requestMatchers(HttpMethod.GET, "/api/sessions/**").permitAll() // anyone can view
                        .requestMatchers(HttpMethod.POST, "/api/sessions/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/sessions/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/**").hasRole("MANAGER")

                        // Actuator
                        .requestMatchers("/actuator/**").permitAll()

                        // All other requests require authentication
                        .anyRequest().authenticated())

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

        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "https://tourhub.space"));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        config.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Refresh-Request"));

        config.setExposedHeaders(List.of("Set-Cookie"));

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
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder builder = http.getSharedObject(AuthenticationManagerBuilder.class);

        builder.authenticationProvider(authenticationProvider());
        return builder.build();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new NullSecurityContextRepository();
    }

}