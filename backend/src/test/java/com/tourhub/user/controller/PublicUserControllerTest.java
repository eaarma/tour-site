package com.tourhub.user.controller;

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

import com.tourhub.user.dto.PublicManagerProfileDto;
import com.tourhub.security.CustomUserDetailsService;
import com.tourhub.security.JwtService;
import com.tourhub.user.service.UserService;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;

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


