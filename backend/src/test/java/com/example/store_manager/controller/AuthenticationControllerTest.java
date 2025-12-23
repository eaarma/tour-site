package com.example.store_manager.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import jakarta.servlet.http.Cookie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.dto.auth.AuthTokens;
import com.example.store_manager.dto.user.UserRegisterRequestDto;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.UserRepository;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.security.testutil.TestUserFactory;
import com.example.store_manager.service.AuthService;
import com.example.store_manager.service.RegistrationService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthenticationControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        /* ===================== MOCKS ===================== */

        @MockitoBean
        private AuthService authService;

        @MockitoBean
        private RegistrationService registrationService;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @MockitoBean
        private UserRepository userRepository;

        /* ===================== REGISTER ===================== */

        @Test
        void registerUser_returnsOk_whenSuccess() throws Exception {
                UserRegisterRequestDto dto = UserRegisterRequestDto.builder()
                                .email("test@example.com")
                                .password("password123")
                                .name("Test User")
                                .phone("+49123456789")
                                .build();

                when(registrationService.registerUser(any()))
                                .thenReturn(Result.ok(new UserResponseDto()));

                mockMvc.perform(post("/auth/register/user")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        @Test
        void registerUser_returnsBadRequest_whenServiceFails() throws Exception {
                when(registrationService.registerUser(any()))
                                .thenReturn(Result.fail(ApiError.badRequest("Email already in use")));

                mockMvc.perform(post("/auth/register/user")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isBadRequest());
        }

        /* ===================== LOGIN ===================== */

        @Test
        void login_setsCookies_andReturnsOk_whenSuccess() throws Exception {
                AuthTokens tokens = new AuthTokens("access", "refresh", Instant.now());

                when(authService.login(any()))
                                .thenReturn(Result.ok(tokens));

                mockMvc.perform(post("/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "email": "a@b.com",
                                                  "password": "pw"
                                                }
                                                """))
                                .andExpect(status().isOk())
                                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
        }

        @Test
        void login_returnsBadRequest_whenServiceFails() throws Exception {
                when(authService.login(any()))
                                .thenReturn(Result.fail(ApiError.badRequest("Invalid credentials")));

                mockMvc.perform(post("/auth/login")
                                .with(csrf())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "email": "a@b.com",
                                                  "password": "pw"
                                                }
                                                """))
                                .andExpect(status().isBadRequest());
        }

        /* ===================== LOGOUT ===================== */

        @Test
        void logout_clearsCookies_andReturnsOk() throws Exception {
                when(authService.logout(any()))
                                .thenReturn(Result.ok(true));

                mockMvc.perform(post("/auth/logout")
                                .with(csrf()))
                                .andExpect(status().isOk())
                                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
        }

        /* ===================== ME ===================== */

        @Test
        void me_returnsUnauthorized_whenTokenInvalid() throws Exception {
                when(jwtService.validateAccessToken("bad"))
                                .thenReturn(false);

                mockMvc.perform(get("/auth/me")
                                .cookie(new Cookie("accessToken", "bad")))
                                .andExpect(status().isUnauthorized());
        }

        @Test
        void me_returnsUser_whenTokenValid() throws Exception {
                UUID userId = UUID.randomUUID();

                User user = new User();
                user.setId(userId);
                user.setEmail("test@example.com");
                user.setName("Test");
                user.setRole(Role.USER);

                when(jwtService.validateAccessToken("good"))
                                .thenReturn(true);
                when(jwtService.getUserId("good"))
                                .thenReturn(userId);
                when(userRepository.findById(userId))
                                .thenReturn(Optional.of(user));

                // 🔑 REQUIRED for JwtAuthenticationFilter
                when(customUserDetailsService.loadUserById(userId))
                                .thenReturn(TestUserFactory.userWithRole("USER"));

                mockMvc.perform(get("/auth/me")
                                .cookie(new Cookie("accessToken", "good")))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        /* ===================== REFRESH ===================== */

        @Test
        void refresh_setsCookies_andReturnsNoContent_whenSuccess() throws Exception {
                AuthTokens tokens = new AuthTokens("new-access", "new-refresh", Instant.now());

                when(authService.refresh("refresh"))
                                .thenReturn(Result.ok(tokens));

                mockMvc.perform(post("/auth/refresh")
                                .with(csrf())
                                .cookie(new Cookie("refreshToken", "refresh")))
                                .andExpect(status().isNoContent())
                                .andExpect(header().exists(HttpHeaders.SET_COOKIE));
        }

        @Test
        void refresh_returnsUnauthorized_whenServiceFails() throws Exception {
                when(authService.refresh(any()))
                                .thenReturn(Result.fail(ApiError.forbidden("Invalid refresh token")));

                mockMvc.perform(post("/auth/refresh")
                                .with(csrf())
                                .cookie(new Cookie("refreshToken", "bad")))
                                .andExpect(status().isUnauthorized());
        }
}
