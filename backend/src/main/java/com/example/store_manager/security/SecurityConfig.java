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

    private static final String[] STAFF = { "MANAGER", "ADMIN" };
    private static final String[] MANAGEMENT = { "MANAGER", "OWNER", "ADMIN" };
    private static final String[] ALL_AUTH = { "USER", "MANAGER", "OWNER", "ADMIN" };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, HandlerMappingIntrospector introspector)
            throws Exception {

        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .securityContext(sc -> sc.securityContextRepository(securityContextRepository()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(csrf -> csrf.disable())

                .securityContext(security -> security.requireExplicitSave(false))

                .authorizeHttpRequests(auth -> auth

                        // Public / Auth
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/auth/me").authenticated()

                        // Stripe / Checkout
                        .requestMatchers("/checkout/stripe/**").permitAll()
                        .requestMatchers("/stripe/webhook").permitAll()
                        .requestMatchers(HttpMethod.GET, "/public/payments/order/**").permitAll()
                        .requestMatchers("/public/orders/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/public/users/managers/*").permitAll()

                        // Users
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        // Tours
                        .requestMatchers(HttpMethod.GET, "/tours/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/tours").permitAll()
                        .requestMatchers(HttpMethod.GET, "/tours/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/tours/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.PUT, "/tours/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.PATCH, "/tours/*/status").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/tours/**").hasAnyRole(STAFF)

                        // Orders
                        .requestMatchers(HttpMethod.GET, "/orders/guest/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/orders/guest").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders/*/status").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/orders/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/orders").hasAnyRole(ALL_AUTH)
                        .requestMatchers(HttpMethod.POST, "/orders/**").hasAnyRole(ALL_AUTH)
                        .requestMatchers(HttpMethod.PUT, "/orders/**").hasAnyRole(MANAGEMENT)
                        .requestMatchers(HttpMethod.PATCH, "/orders/**").hasAnyRole(MANAGEMENT)
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasAnyRole(MANAGEMENT)

                        // Order items
                        .requestMatchers(HttpMethod.PATCH, "/orders/items/**").hasAnyRole(MANAGEMENT)
                        .requestMatchers(HttpMethod.POST, "/orders/items/*/cancel").permitAll()

                        // Checkout
                        .requestMatchers(HttpMethod.POST, "/checkout/reserve").permitAll()
                        .requestMatchers(HttpMethod.POST, "/checkout/finalize").permitAll()

                        // Payments
                        .requestMatchers(HttpMethod.GET, "/payments/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/payments/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/payouts/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/payouts/admin/**").hasRole("ADMIN")

                        // Shops & Shop Users
                        .requestMatchers(HttpMethod.GET, "/shops/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/shops/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.PUT, "/shops/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/shops/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/shop-users/shop/*/active/public").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/shop-users/shop/*/request").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.POST, "/api/shop-users/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/shop-users/**").authenticated()
                        .requestMatchers(HttpMethod.PATCH, "/api/shop-users/**").authenticated()

                        // Schedules
                        .requestMatchers(HttpMethod.GET, "/schedules/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/schedules/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.PATCH, "/schedules/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.DELETE, "/schedules/**").hasAnyRole(STAFF)

                        // Tour Images
                        .requestMatchers(HttpMethod.GET, "/tourimages/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/tourimages/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.DELETE, "/tourimages/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.PUT, "/tourimages/**").hasAnyRole(STAFF)

                        // Sessions
                        .requestMatchers(HttpMethod.GET, "/api/sessions/admin").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/sessions/shops/*/stats/tours-given").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/sessions/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/sessions/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.PATCH, "/api/sessions/**").hasAnyRole(STAFF)
                        .requestMatchers(HttpMethod.DELETE, "/api/sessions/**").hasAnyRole(STAFF)

                        // Actuator
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        .requestMatchers("/actuator/prometheus").permitAll()
                        .requestMatchers("/actuator/**").hasRole("ADMIN")

                        // Everything else
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
