package com.example.store_manager.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.dto.schedule.TourScheduleCreateDto;
import com.example.store_manager.dto.schedule.TourScheduleResponseDto;
import com.example.store_manager.dto.schedule.TourScheduleUpdateDto;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.TourScheduleService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = TourScheduleController.class)
@AutoConfigureMockMvc(addFilters = false)
class TourScheduleControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private TourScheduleService service;

        // Security deps (present but inactive)
        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        MeterRegistry meterRegistry;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        // ------------------------
        // Helpers
        // ------------------------

        private TourScheduleCreateDto validCreateDto() {
                return TourScheduleCreateDto.builder()
                                .tourId(1L)
                                .date(LocalDate.now().plusDays(1))
                                .time(LocalTime.of(10, 0))
                                .maxParticipants(10)
                                .build();
        }

        private TourScheduleUpdateDto validUpdateDto() {
                return TourScheduleUpdateDto.builder()
                                .maxParticipants(12)
                                .build();
        }

        private TourScheduleResponseDto responseDto() {
                return TourScheduleResponseDto.builder()
                                .id(1L)
                                .status("ACTIVE")
                                .build();
        }

        // ------------------------
        // CREATE
        // ------------------------

        @Test
        void create_returnsOk_whenSuccess() throws Exception {
                when(service.createSchedule(any()))
                                .thenReturn(Result.ok(responseDto()));

                mockMvc.perform(post("/schedules")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validCreateDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void create_returnsNotFound_whenTourMissing() throws Exception {
                when(service.createSchedule(any()))
                                .thenReturn(Result.fail(ApiError.notFound("Tour not found")));

                mockMvc.perform(post("/schedules")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validCreateDto())))
                                .andExpect(status().isNotFound());
        }

        @Test
        void create_returnsBadRequest_whenValidationFails() throws Exception {
                mockMvc.perform(post("/schedules")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isBadRequest());
        }

        // ------------------------
        // GET FOR TOUR
        // ------------------------

        @Test
        void getSchedulesForTour_returnsOk() throws Exception {
                when(service.getSchedulesForTour(1L))
                                .thenReturn(Result.ok(List.of(responseDto())));

                mockMvc.perform(get("/schedules/tour/{tourId}", 1L))
                                .andExpect(status().isOk());
        }

        // ------------------------
        // GET BY ID
        // ------------------------

        @Test
        void getById_returnsOk_whenFound() throws Exception {
                when(service.getScheduleById(1L))
                                .thenReturn(Result.ok(responseDto()));

                mockMvc.perform(get("/schedules/{id}", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getById_returnsNotFound_whenMissing() throws Exception {
                when(service.getScheduleById(1L))
                                .thenReturn(Result.fail(ApiError.notFound("Schedule not found")));

                mockMvc.perform(get("/schedules/{id}", 1L))
                                .andExpect(status().isNotFound());
        }

        // ------------------------
        // UPDATE
        // ------------------------

        @Test
        void update_returnsOk_whenSuccess() throws Exception {
                when(service.updateSchedule(eq(1L), any()))
                                .thenReturn(Result.ok(responseDto()));

                mockMvc.perform(patch("/schedules/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validUpdateDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void update_returnsNotFound_whenMissing() throws Exception {
                when(service.updateSchedule(eq(1L), any()))
                                .thenReturn(Result.fail(ApiError.notFound("Schedule not found")));

                mockMvc.perform(patch("/schedules/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validUpdateDto())))
                                .andExpect(status().isNotFound());
        }

        // ------------------------
        // DELETE
        // ------------------------

        @Test
        void delete_returnsOk_whenSuccess() throws Exception {
                when(service.deleteSchedule(1L))
                                .thenReturn(Result.ok(true));

                mockMvc.perform(delete("/schedules/{id}", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void delete_returnsNotFound_whenMissing() throws Exception {
                when(service.deleteSchedule(1L))
                                .thenReturn(Result.fail(ApiError.notFound("Schedule not found")));

                mockMvc.perform(delete("/schedules/{id}", 1L))
                                .andExpect(status().isNotFound());
        }
}
