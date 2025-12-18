package com.example.store_manager.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.auth.AuthTokens;
import com.example.store_manager.dto.user.ManagerRegisterRequestDto;
import com.example.store_manager.dto.user.LoginRequestDto;
import com.example.store_manager.dto.user.UserRegisterRequestDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.AuthService;
import com.example.store_manager.service.RefreshTokenService;
import com.example.store_manager.service.RegistrationService;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ResultResponseMapper;
import com.example.store_manager.utility.ShopAssignmentUtil;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
        private final AuthenticationManager authManager;
        private final JwtService jwtService;
        private final PasswordEncoder passwordEncoder;
        private final UserRepository userRepository;
        private final ShopAssignmentUtil shopAssignmentUtil;
        private final ShopUserRepository shopUserRepository;
        private final RefreshTokenService refreshTokenService;
        private final AuthService authService;
        private final RegistrationService registrationService;

        @Value("${spring.profiles.active:dev}")
        private String activeProfile;

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

                Result<AuthTokens> result = authService.login(dto);

                if (result.isFail()) {
                        return ResultResponseMapper.toResponse(result);
                }

                AuthTokens tokens = result.get();

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("accessToken", tokens.accessToken(), 15 * 60, true).toString());

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("refreshToken", tokens.refreshToken(), 7 * 24 * 60 * 60, true).toString());

                return ResponseEntity.ok().build();
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken,
                        HttpServletResponse response) {

                authService.logout(refreshToken);

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("accessToken", "", 0, true).toString());

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("refreshToken", "", 0, true).toString());

                return ResponseEntity.ok().build();
        }

        @GetMapping("/me")
        public ResponseEntity<UserResponseDto> getCurrentUser(
                        @CookieValue(name = "accessToken", required = false) String token) {

                if (token == null || !jwtService.validateAccessToken(token)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                UUID userId = jwtService.getUserId(token);
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                UserResponseDto dto = UserResponseDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();

                return ResponseEntity.ok(dto);
        }

        private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds, boolean httpOnly) {

                return ResponseCookie.from(name, value)
                                .httpOnly(httpOnly)
                                .path("/")
                                .secure(true)
                                .sameSite("None") // REQUIRED for cross-site cookies
                                .maxAge(maxAgeSeconds)
                                .build();
        }

        @PostMapping("/refresh")
        public ResponseEntity<?> refresh(
                        @CookieValue(name = "refreshToken", required = false) String refreshToken,
                        HttpServletResponse response) {

                Result<AuthTokens> result = authService.refresh(refreshToken);

                if (result.isFail()) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                AuthTokens tokens = result.get();

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("accessToken", tokens.accessToken(), 15 * 60, true).toString());

                response.addHeader(HttpHeaders.SET_COOKIE,
                                buildCookie("refreshToken", tokens.refreshToken(), 7 * 24 * 60 * 60, true).toString());

                return ResponseEntity.noContent().build();
        }

}