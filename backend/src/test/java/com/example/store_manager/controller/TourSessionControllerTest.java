package com.example.store_manager.controller;

import com.example.store_manager.dto.tourSession.TourSessionDetailsDto;
import com.example.store_manager.model.SessionStatus;
import com.example.store_manager.service.TourSessionService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import java.util.UUID;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TourSessionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TourSessionControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private TourSessionService service;

        // Security deps (present but inactive)
        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        // ------------------------
        // Helpers
        // ------------------------

        private TourSessionDetailsDto sessionDto() {
                return TourSessionDetailsDto.builder()
                                .id(1L)
                                .status(SessionStatus.PLANNED)
                                .build();
        }

        // ------------------------
        // GET sessions for tour
        // ------------------------

        @Test
        void getByTour_returnsOk() throws Exception {
                when(service.getSessions(1L))
                                .thenReturn(Result.ok(List.of(sessionDto())));

                mockMvc.perform(get("/api/sessions/tour/{tourId}", 1L))
                                .andExpect(status().isOk());
        }

        // ------------------------
        // GET by id
        // ------------------------

        @Test
        void getById_returnsOk_whenFound() throws Exception {
                when(service.getSession(1L))
                                .thenReturn(Result.ok(sessionDto()));

                mockMvc.perform(get("/api/sessions/{id}", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getById_returnsNotFound_whenMissing() throws Exception {
                when(service.getSession(1L))
                                .thenReturn(Result.fail(ApiError.notFound("Session not found")));

                mockMvc.perform(get("/api/sessions/{id}", 1L))
                                .andExpect(status().isNotFound());
        }

        // ------------------------
        // Assign manager
        // ------------------------

        @Test
        void assignManager_returnsOk_whenSuccess() throws Exception {
                UUID managerId = UUID.randomUUID();

                when(service.assignManager(1L, managerId))
                                .thenReturn(Result.ok(sessionDto()));

                mockMvc.perform(patch("/api/sessions/{id}/assign-manager", 1L)
                                .param("managerId", managerId.toString()))
                                .andExpect(status().isOk());
        }

        @Test
        void assignManager_returnsNotFound_whenSessionMissing() throws Exception {
                UUID managerId = UUID.randomUUID();

                when(service.assignManager(1L, managerId))
                                .thenReturn(Result.fail(ApiError.notFound("Session not found")));

                mockMvc.perform(patch("/api/sessions/{id}/assign-manager", 1L)
                                .param("managerId", managerId.toString()))
                                .andExpect(status().isNotFound());
        }

        // ------------------------
        // Update status
        // ------------------------

        @Test
        void updateStatus_returnsOk_whenSuccess() throws Exception {
                when(service.updateStatus(1L, SessionStatus.PLANNED))
                                .thenReturn(Result.ok(sessionDto()));

                mockMvc.perform(patch("/api/sessions/{id}/status", 1L)
                                .param("status", "PLANNED"))
                                .andExpect(status().isOk());
        }

        @Test
        void updateStatus_returnsBadRequest_whenInvalidTransition() throws Exception {
                when(service.updateStatus(1L, SessionStatus.COMPLETED))
                                .thenReturn(Result.fail(
                                                ApiError.badRequest("Completed sessions cannot change status")));

                mockMvc.perform(patch("/api/sessions/{id}/status", 1L)
                                .param("status", "COMPLETED"))
                                .andExpect(status().isBadRequest());
        }

        // ------------------------
        // Sessions for shop
        // ------------------------

        @Test
        void getSessionsForShop_returnsOk() throws Exception {
                when(service.getSessionsForShop(1L))
                                .thenReturn(Result.ok(List.of(sessionDto())));

                mockMvc.perform(get("/api/sessions/shop/{shopId}", 1L))
                                .andExpect(status().isOk());
        }

        // ------------------------
        // Sessions for manager
        // ------------------------

        @Test
        void getSessionsForManager_returnsOk() throws Exception {
                UUID managerId = UUID.randomUUID();

                when(service.getSessionsForManager(managerId))
                                .thenReturn(Result.ok(List.of(sessionDto())));

                mockMvc.perform(get("/api/sessions/manager/{id}", managerId))
                                .andExpect(status().isOk());
        }

        @Test
        void getSessionsForManager_returnsNotFound_whenManagerMissing() throws Exception {
                UUID managerId = UUID.randomUUID();

                when(service.getSessionsForManager(managerId))
                                .thenReturn(Result.fail(ApiError.notFound("Manager not found")));

                mockMvc.perform(get("/api/sessions/manager/{id}", managerId))
                                .andExpect(status().isNotFound());
        }
}
