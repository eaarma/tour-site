package com.example.store_manager.controller;

import java.util.UUID;
import com.example.store_manager.dto.user.UserResponseDto;
import com.example.store_manager.dto.user.UserUpdateDto;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.UserService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private CurrentUserService currentUserService;

        // Security beans (present but inactive)
        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        MeterRegistry meterRegistry;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        // ------------------------
        // Helpers
        // ------------------------

        private UserResponseDto userDto(UUID id) {
                return UserResponseDto.builder()
                                .id(id)
                                .email("test@example.com")
                                .name("Test User")
                                .build();
        }

        private UserUpdateDto updateDto() {
                return UserUpdateDto.builder()
                                .name("Updated Name")
                                .build();
        }

        // ------------------------
        // GET /me
        // ------------------------

        @Test
        void getProfile_returnsOk_whenUserExists() throws Exception {
                UUID userId = UUID.randomUUID();

                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                when(userService.getUserProfile(userId))
                                .thenReturn(Result.ok(userDto(userId)));

                mockMvc.perform(get("/api/users/me"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.email").value("test@example.com"));
        }

        @Test
        void getProfile_returnsNotFound_whenMissing() throws Exception {
                UUID userId = UUID.randomUUID();

                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                when(userService.getUserProfile(userId))
                                .thenReturn(Result.fail(ApiError.notFound("User not found")));

                mockMvc.perform(get("/api/users/me"))
                                .andExpect(status().isNotFound());
        }

        // ------------------------
        // PUT /me
        // ------------------------

        @Test
        void updateProfile_returnsOk_whenSuccess() throws Exception {
                UUID userId = UUID.randomUUID();

                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                when(userService.updateProfile(eq(userId), any()))
                                .thenReturn(Result.ok(userDto(userId)));

                mockMvc.perform(put("/api/users/me")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void updateProfile_returnsNotFound_whenMissing() throws Exception {
                UUID userId = UUID.randomUUID();

                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                when(userService.updateProfile(eq(userId), any()))
                                .thenReturn(Result.fail(ApiError.notFound("User not found")));

                mockMvc.perform(put("/api/users/me")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateDto())))
                                .andExpect(status().isNotFound());
        }

        // ------------------------
        // GET /{id}
        // ------------------------

        @Test
        void getUserById_returnsOk_whenFound() throws Exception {
                UUID userId = UUID.randomUUID();

                when(userService.getUserProfile(userId))
                                .thenReturn(Result.ok(userDto(userId)));

                mockMvc.perform(get("/api/users/{id}", userId))
                                .andExpect(status().isOk());
        }

        @Test
        void getUserById_returnsNotFound_whenMissing() throws Exception {
                UUID userId = UUID.randomUUID();

                when(userService.getUserProfile(userId))
                                .thenReturn(Result.fail(ApiError.notFound("User not found")));

                mockMvc.perform(get("/api/users/{id}", userId))
                                .andExpect(status().isNotFound());
        }
}
