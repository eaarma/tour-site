package com.example.store_manager.controller;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;

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

        @PostMapping("/register/user")
        public ResponseEntity<UserResponseDto> registerUser(@RequestBody @Valid UserRegisterRequestDto request) {
                User newUser = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName())
                                .phone(request.getPhone())
                                .nationality(request.getNationality())
                                .createdAt(LocalDateTime.now())
                                .role(Role.USER)
                                .build();

                User savedUser = userRepository.save(newUser);

                return ResponseEntity.ok(UserResponseDto.builder()
                                .id(savedUser.getId())
                                .name(savedUser.getName())
                                .email(savedUser.getEmail())
                                .role(savedUser.getRole().name())
                                .build());
        }

        @PostMapping("/register/manager")
        public ResponseEntity<UserResponseDto> registerAdmin(@RequestBody @Valid ManagerRegisterRequestDto request) {
                User newAdmin = User.builder()
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .name(request.getName())
                                .phone(request.getPhone())
                                .role(Role.MANAGER)
                                .bio(request.getBio())
                                .experience(request.getExperience())
                                .languages(request.getLanguages())
                                .createdAt(LocalDateTime.now())
                                .build();

                User savedAdmin = userRepository.save(newAdmin);

                Shop shop = shopAssignmentUtil.assignRandomShopToManager();
                ShopUser shopUser = ShopUser.builder()
                                .shop(shop)
                                .user(savedAdmin)
                                .role(ShopUserRole.MANAGER)
                                .status(ShopUserStatus.ACTIVE)
                                .createdAt(LocalDateTime.now())
                                .build();

                shopUserRepository.save(shopUser);

                return ResponseEntity.ok(UserResponseDto.builder()
                                .id(savedAdmin.getId())
                                .name(savedAdmin.getName())
                                .email(savedAdmin.getEmail())
                                .role(savedAdmin.getRole().name())
                                .build());
        }

        @PostMapping("/login")
        public ResponseEntity<?> login(@RequestBody LoginRequestDto loginDto, HttpServletResponse response,
                        @Value("${spring.profiles.active:dev}") String activeProfile) {
                Authentication authentication = authManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword()));

                User user = userRepository.findByEmail(loginDto.getEmail()).orElseThrow();

                String accessToken = jwtService.generateToken(authentication);

                // Determine if cookie should be secure
                boolean isSecure = "prod".equals(activeProfile);

                ResponseCookie cookie = ResponseCookie.from("accessToken", accessToken)
                                .httpOnly(true)
                                .secure(isSecure)
                                .path("/")
                                .maxAge(24 * 60 * 60) // 1 day
                                .sameSite("Strict")
                                .build();

                response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

                return ResponseEntity.ok(UserResponseDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build());
        }

        @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletResponse response,
                        @Value("${spring.profiles.active:dev}") String activeProfile) {

                boolean isSecure = "prod".equals(activeProfile);

                ResponseCookie deleteCookie = ResponseCookie.from("accessToken", "")
                                .httpOnly(true)
                                .secure(isSecure)
                                .path("/")
                                .maxAge(0) // expire immediately
                                .sameSite("Strict")
                                .build();

                response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());
                return ResponseEntity.ok().build();
        }

        @PostMapping("/refresh")
        public ResponseEntity<JwtResponseDto> refresh(@RequestBody Map<String, String> request) {
                String refreshToken = request.get("refreshToken");

                if (refreshToken == null || !jwtService.validateToken(refreshToken)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                String email = jwtService.getUsernameFromToken(refreshToken);
                User user = userRepository.findByEmail(email).orElseThrow();

                String newAccessToken = jwtService.generateToken(
                                new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList()));

                UserResponseDto userResponse = UserResponseDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();

                JwtResponseDto response = JwtResponseDto.builder()
                                .token(newAccessToken)
                                .refreshToken(refreshToken) // You can return the same one or issue a new one
                                .user(userResponse)
                                .build();

                return ResponseEntity.ok(response);
        }

        @GetMapping("/me")
        public ResponseEntity<UserResponseDto> getCurrentUser(
                        @CookieValue(name = "accessToken", required = false) String token) {
                if (token == null || !jwtService.validateToken(token)) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }

                String email = jwtService.getUsernameFromToken(token);
                User user = userRepository.findByEmail(email).orElseThrow();

                UserResponseDto dto = UserResponseDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .role(user.getRole().name())
                                .build();

                return ResponseEntity.ok(dto);
        }

}