package com.tourhub.auth.controller;

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

import com.tourhub.user.dto.UserResponseDto;
import com.tourhub.user.mapper.UserMapper;
import com.tourhub.user.model.User;
import com.tourhub.user.repository.UserRepository;
import com.tourhub.security.CustomUserDetails;
import com.tourhub.security.JwtService;
import com.tourhub.security.RefreshSecurityProperties;
import com.tourhub.common.result.Result;
import com.tourhub.common.result.ResultResponseMapper;
import com.tourhub.auth.dto.AuthResponseDto;
import com.tourhub.auth.dto.AuthTokens;
import com.tourhub.auth.dto.ForgotPasswordRequestDto;
import com.tourhub.auth.dto.LoginRequestDto;
import com.tourhub.auth.dto.ManagerRegisterRequestDto;
import com.tourhub.auth.dto.ResetPasswordRequestDto;
import com.tourhub.auth.dto.UserRegisterRequestDto;
import com.tourhub.auth.dto.VerifyEmailRequestDto;
import com.tourhub.auth.dto.VerifyEmailResendRequestDto;
import com.tourhub.auth.service.AuthService;
import com.tourhub.auth.service.PasswordResetService;
import com.tourhub.auth.service.RegistrationService;
import com.tourhub.auth.service.VerificationService;

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

        private final VerificationService verificationService;

        private final PasswordResetService passwordResetService;

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
                                buildCookie("refreshToken", tokens.refreshToken(), 1 * 24 * 60 * 60, isProd)
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
                                .httpOnly(true)
                                .secure(secure)
                                .sameSite("none")
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
                                buildCookie("refreshToken", tokens.refreshToken(), 1 * 24 * 60 * 60, isProd)
                                                .toString());

                return ResponseEntity.ok(Map.of("accessToken", tokens.accessToken()));
        }

        @PostMapping("/verify-email")
        public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequestDto request) {

                return ResultResponseMapper.toResponse(
                                verificationService.verifyEmail(request.getToken()));
        }

        @PostMapping("/password/forgot")
        public ResponseEntity<?> forgotPassword(
                        @RequestBody ForgotPasswordRequestDto dto) {

                return ResultResponseMapper.toResponse(
                                passwordResetService.requestPasswordReset(dto.getEmail()));
        }

        @PostMapping("/password/reset")
        public ResponseEntity<?> resetPassword(
                        @RequestBody ResetPasswordRequestDto dto) {

                return ResultResponseMapper.toResponse(
                                passwordResetService.resetPassword(dto.getToken(), dto.getNewPassword()));
        }

        @PostMapping("/resend-verification")
        public ResponseEntity<?> resendVerification(
                        @RequestBody @Valid VerifyEmailResendRequestDto request) {

                return ResultResponseMapper.toResponse(
                                verificationService.resendVerificationEmail(request.getEmail()));
        }

}


