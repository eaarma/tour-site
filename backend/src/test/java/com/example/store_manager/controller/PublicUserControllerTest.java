package com.example.store_manager.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.dto.user.PublicManagerProfileDto;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.UserService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = PublicUserController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    MeterRegistry meterRegistry;

    @Test
    void getPublicManagerProfile_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();

        when(userService.getPublicManagerProfile(userId))
                .thenReturn(Result.ok(new PublicManagerProfileDto()));

        mockMvc.perform(get("/public/users/managers/{id}", userId))
                .andExpect(status().isOk());
    }

    @Test
    void getPublicManagerProfile_returnsNotFound_whenMissing() throws Exception {
        UUID userId = UUID.randomUUID();

        when(userService.getPublicManagerProfile(userId))
                .thenReturn(Result.fail(ApiError.notFound("Manager not found")));

        mockMvc.perform(get("/public/users/managers/{id}", userId))
                .andExpect(status().isNotFound());
    }
}
