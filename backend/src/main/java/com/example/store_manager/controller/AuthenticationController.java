package com.example.store_manager.controller;

import java.util.Map;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.auth.AuthResponseDto;
import com.example.store_manager.dto.auth.AuthTokens;
import com.example.store_manager.dto.user.LoginRequestDto;
import com.example.store_manager.dto.user.ManagerRegisterRequestDto;
import com.example.store_manager.dto.user.UserRegisterRequestDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.mapper.UserMapper;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.security.RefreshSecurityProperties;
import com.example.store_manager.service.AuthService;
import com.example.store_manager.service.RegistrationService;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

        private final JwtService jwtService;

        private final UserRepository userRepository;

        private final UserMapper userMapper;

        private final AuthService authService;

        private final RegistrationService registrationService;

        private final RefreshSecurityProperties refreshSecurityProperties;

        private final Environment environment;

        @PostMapping("/register/user")
        public ResponseEntity<?> registerUser(
                        @RequestBody @Valid UserRegisterRequestDto request) {

                return ResultResponseMapper.toResponse(
                                registrationService.registerUser(request));
        }

        @PostMapping("/register/manager")
        public ResponseEntity<?> registerManager(
                        @RequestBody @Valid ManagerRegisterRequestDto request) {

                return ResultResponseMapper.toResponse(
                                registrationService.registerManager(request));
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(
                        @RequestBody @Valid LoginRequestDto dto,
                        HttpServletResponse response) {

                boolean isProd = environment.acceptsProfiles("prod");

                Result<AuthTokens> result = authService.login(dto);

                if (result.isFail()) {
                        return ResultResponseMapper.toResponse(result);
                }

                AuthTokens tokens = result.get();

                // Refresh token as HttpOnly cookie
                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("refreshToken", tokens.refreshToken(), 7 * 24 * 60 * 60, isProd)
                                                .toString());

                User user = userRepository.findByEmail(dto.getEmail().trim().toLowerCase())
                                .orElseThrow();
                return ResponseEntity.ok(
                                new AuthResponseDto(
                                                tokens.accessToken(),
                                                userMapper.toDto(user)));
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken,
                        HttpServletResponse response) {

                authService.logout(refreshToken);

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("refreshToken", "", 0, true).toString());

                return ResponseEntity.ok().build();
        }

        @GetMapping("/me")
        public ResponseEntity<UserResponseDto> getCurrentUser(Authentication authentication) {

                if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails cud)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                User user = cud.getUser();

                return ResponseEntity.ok(userMapper.toDto(user));
        }

        private ResponseCookie buildCookie(
                        String name,
                        String value,
                        long maxAgeSeconds,
                        boolean secure) {
                return ResponseCookie.from(name, value)
                                .httpOnly(true) // refresh token should ALWAYS be HttpOnly
                                .secure(secure) // ✅ environment-controlled
                                .sameSite("none") // required for cross-site cookies
                                .path("/")
                                .maxAge(maxAgeSeconds)
                                .build();
        }

        @PostMapping("/refresh")
        public ResponseEntity<?> refresh(
                        HttpServletRequest request,
                        @CookieValue(name = "refreshToken", required = false) String refreshToken,
                        HttpServletResponse response) {

                boolean isProd = environment.acceptsProfiles("prod");

                // 1) Require custom header
                if (!"true".equals(request.getHeader("X-Refresh-Request"))) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }

                // 2️) Validate Origin
                String origin = request.getHeader("Origin");
                if (origin == null || !refreshSecurityProperties.getAllowedOrigins().contains(origin)) {
                        throw new AccessDeniedException("Invalid origin");
                }
                // 3) Existing refresh logic
                Result<AuthTokens> result = authService.refresh(refreshToken);

                if (result.isFail()) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                AuthTokens tokens = result.get();

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("refreshToken", tokens.refreshToken(), 7 * 24 * 60 * 60, isProd)
                                                .toString());

                return ResponseEntity.ok(Map.of("accessToken", tokens.accessToken()));
        }

}