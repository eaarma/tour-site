package com.example.store_manager.controller;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.dto.auth.JwtResponseDto;
import com.example.store_manager.dto.user.ManagerRegisterRequestDto;
import com.example.store_manager.dto.user.LoginRequestDto;
import com.example.store_manager.dto.user.UserRegisterRequestDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.Shop;
import com.example.store_manager.model.ShopUser;
import com.example.store_manager.model.ShopUserRole;
import com.example.store_manager.model.ShopUserStatus;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.ShopUserRepository;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.RefreshTokenService;
import com.example.store_manager.utility.ShopAssignmentUtil;
import jakarta.servlet.http.Cookie;

import jakarta.servlet.http.HttpServletRequest;
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

        @Value("${spring.profiles.active:dev}")
        private String activeProfile;

        @PostMapping("/register/user")
        public ResponseEntity<?> registerUser(@RequestBody @Valid UserRegisterRequestDto request) {

                String email = request.getEmail().trim().toLowerCase();

                // Email uniqueness
                if (userRepository.existsByEmail(email)) {
                        throw new IllegalArgumentException("Email already in use");
                }

                // Build new user
                User newUser = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName().trim())
                                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                                .nationality(request.getNationality())
                                .createdAt(LocalDateTime.now())
                                .role(Role.USER)
                                .build();

                User saved = userRepository.save(newUser);

                return ResponseEntity.ok(UserResponseDto.builder()
                                .id(saved.getId())
                                .name(saved.getName())
                                .email(saved.getEmail())
                                .role(saved.getRole().name())
                                .build());
        }

        @PostMapping("/register/manager")
        public ResponseEntity<?> registerManager(@RequestBody @Valid ManagerRegisterRequestDto request) {

                String email = request.getEmail().trim().toLowerCase();

                if (userRepository.existsByEmail(email)) {
                        throw new IllegalArgumentException("Email already in use");
                }

                User manager = User.builder()
                                .email(email)
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName().trim())
                                .phone(request.getPhone())
                                .bio(request.getBio())
                                .experience(request.getExperience())
                                .languages(request.getLanguages())
                                .createdAt(LocalDateTime.now())
                                .role(Role.MANAGER)
                                .build();

                User saved = userRepository.save(manager);

                // Auto assign shop
                Shop shop = shopAssignmentUtil.assignRandomShopToManager();
                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(saved)
                                .role(ShopUserRole.MANAGER)
                                .status(ShopUserStatus.ACTIVE)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);

                return ResponseEntity.ok(UserResponseDto.builder()
                                .id(saved.getId())
                                .name(saved.getName())
                                .email(saved.getEmail())
                                .role(saved.getRole().name())
                                .build());
        }

        @PostMapping("/login")
        public ResponseEntity<UserResponseDto> login(
                        @RequestBody @Valid LoginRequestDto loginDto,
                        HttpServletResponse response) {

                if (loginDto.getEmail() == null || loginDto.getPassword() == null) {
                        throw new IllegalArgumentException("Email and password are required");
                }

                String email = loginDto.getEmail().trim().toLowerCase();
                String password = loginDto.getPassword();

                if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                        throw new IllegalArgumentException("Invalid email format");
                }

                Authentication authentication;
                try {
                        authentication = authManager.authenticate(
                                        new UsernamePasswordAuthenticationToken(email, password));
                } catch (Exception e) {
                        throw new IllegalArgumentException("Invalid email or password");
                }

                User user = userRepository.findByEmail(email).orElseThrow();

                // ✅ Generate tokens
                String accessToken = jwtService.generateAccessToken(user);
                String refreshToken = jwtService.generateRefreshToken(user);

                // ✅ Persist refresh token
                refreshTokenService.store(user, refreshToken, jwtService.getRefreshExpiryInstant());

                // ✅ Set cookies
                ResponseCookie accessCookie = buildCookie("accessToken", accessToken, 15 * 60, true); // 15 min
                ResponseCookie refreshCookie = buildCookie("refreshToken", refreshToken, 7 * 24 * 60 * 60, true); // 7
                                                                                                                  // days

                response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                UserResponseDto dto = UserResponseDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();

                return ResponseEntity.ok(dto);
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(
                        HttpServletRequest request,
                        HttpServletResponse response) {

                // Try to extract refresh token cookie (optional but nice for revocation)
                String refreshToken = null;
                if (request.getCookies() != null) {
                        for (Cookie cookie : request.getCookies()) {
                                if ("refreshToken".equals(cookie.getName())) {
                                        refreshToken = cookie.getValue();
                                        break;
                                }
                        }
                }

                if (refreshToken != null && jwtService.validateRefreshToken(refreshToken)) {
                        try {
                                User user = refreshTokenService.validateAndGetUser(refreshToken);
                                refreshTokenService.revokeAllForUser(user);
                        } catch (RuntimeException ignored) {
                                // token already invalid/revoked – ignore
                        }
                }

                // Clear cookies
                ResponseCookie clearAccess = buildCookie("accessToken", "", 0, true);
                ResponseCookie clearRefresh = buildCookie("refreshToken", "", 0, true);

                response.addHeader(HttpHeaders.SET_COOKIE, clearAccess.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, clearRefresh.toString());

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

                if (refreshToken == null || !jwtService.validateRefreshToken(refreshToken)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                try {
                        // Validate + fetch user from DB
                        User user = refreshTokenService.validateAndGetUser(refreshToken);

                        refreshTokenService.revoke(refreshToken);

                        // Rotate tokens
                        String newAccess = jwtService.generateAccessToken(user);
                        String newRefresh = jwtService.generateRefreshToken(user);

                        refreshTokenService.store(user, newRefresh, jwtService.getRefreshExpiryInstant());

                        // Write cookies
                        ResponseCookie accessCookie = buildCookie("accessToken", newAccess, 15 * 60, true);
                        ResponseCookie refreshCookie = buildCookie("refreshToken", newRefresh, 7 * 24 * 60 * 60, true);

                        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
                        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

                        return ResponseEntity.noContent().build(); // 204 success, no body needed
                } catch (Exception ex) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
        }

}