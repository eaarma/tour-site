package com.example.store_manager.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import com.example.store_manager.dto.tour.TourCreateDto;
import com.example.store_manager.dto.tour.TourResponseDto;
import com.example.store_manager.model.TourCategory;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.TourService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@WebMvcTest(TourController.class)
@AutoConfigureMockMvc(addFilters = false)
class TourControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private TourService tourService;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @MockBean
        MeterRegistry meterRegistry;

        // ----------------------------
        // Helpers
        // ----------------------------

        private TourCreateDto validCreateDto() {
                return TourCreateDto.builder()
                                .title("City Walking Tour")
                                .description("A wonderful guided walking tour")
                                .images(List.of("img1.jpg"))
                                .price(BigDecimal.valueOf(49.99))
                                .timeRequired(120)
                                .intensity("MEDIUM")
                                .participants(5)
                                .categories(Set.of(TourCategory.CULTURE))
                                .language(Set.of("EN"))
                                .type("WALKING")
                                .location("Rome")
                                .status("ACTIVE")
                                .shopId(1L)
                                .build();
        }

        private TourResponseDto tourResponse() {
                return TourResponseDto.builder()
                                .id(1L)
                                .title("Test Tour")
                                .build();
        }

        // ----------------------------
        // Tests
        // ----------------------------
        @Test
        void createTour_returnsOk_whenServiceSucceeds() throws Exception {
                when(tourService.createTour(anyLong(), any(), any()))
                                .thenReturn(Result.ok(tourResponse()));

                mockMvc.perform(post("/tours")
                                .with(user("manager"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validCreateDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void createTour_returnsNotFound_whenShopMissing() throws Exception {
                when(tourService.createTour(anyLong(), any(), any()))
                                .thenReturn(Result.fail(ApiError.notFound("Shop not found")));

                mockMvc.perform(post("/tours")
                                .with(user("manager"))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validCreateDto())))
                                .andExpect(status().isNotFound());
        }

        @Test
        void updateTour_returnsOk_whenSuccess() throws Exception {
                when(tourService.updateTour(eq(1L), any()))
                                .thenReturn(Result.ok(tourResponse()));

                mockMvc.perform(put("/tours/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validCreateDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void updateTour_returnsNotFound_whenMissing() throws Exception {
                when(tourService.updateTour(eq(1L), any()))
                                .thenReturn(Result.fail(ApiError.notFound("Tour not found")));

                mockMvc.perform(put("/tours/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validCreateDto())))
                                .andExpect(status().isNotFound());
        }

        @Test
        void getAllTours_returnsOk() throws Exception {
                when(tourService.getAllTours())
                                .thenReturn(Result.ok(List.of(tourResponse())));

                mockMvc.perform(get("/tours"))
                                .andExpect(status().isOk());
        }

        @Test
        void getTourById_returnsOk_whenFound() throws Exception {
                when(tourService.getTourById(1L))
                                .thenReturn(Result.ok(tourResponse()));

                mockMvc.perform(get("/tours/{id}", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getTourById_returnsNotFound_whenMissing() throws Exception {
                when(tourService.getTourById(1L))
                                .thenReturn(Result.fail(ApiError.notFound("Tour not found")));

                mockMvc.perform(get("/tours/{id}", 1L))
                                .andExpect(status().isNotFound());
        }

        @Test
        void getToursByShop_returnsOk() throws Exception {
                when(tourService.getToursByShopId(1L))
                                .thenReturn(Result.ok(List.of(tourResponse())));

                mockMvc.perform(get("/tours/shop/{shopId}", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getRandomTours_returnsOk() throws Exception {
                when(tourService.getRandomTours(5))
                                .thenReturn(Result.ok(List.of(tourResponse())));

                mockMvc.perform(get("/tours/random")
                                .param("count", "5"))
                                .andExpect(status().isOk());
        }

        @Test
        void getHighlightedTour_returnsOk_whenExists() throws Exception {
                when(tourService.getHighlightedTour())
                                .thenReturn(Result.ok(tourResponse()));

                mockMvc.perform(get("/tours/highlighted"))
                                .andExpect(status().isOk());
        }

        @Test
        void getHighlightedTour_returnsNotFound_whenMissing() throws Exception {
                when(tourService.getHighlightedTour())
                                .thenReturn(Result.fail(ApiError.notFound("No active tours found")));

                mockMvc.perform(get("/tours/highlighted"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void getAllByQuery_returnsOk() throws Exception {
                Page<TourResponseDto> page = new PageImpl<>(List.of(tourResponse()));

                when(tourService.getAllByQuery(
                                any(), any(), any(), any(), any(),
                                anyInt(), anyInt(), any()))
                                .thenReturn(Result.ok(page));

                mockMvc.perform(get("/tours/query")
                                .param("page", "0")
                                .param("size", "10")
                                .param("sort", "title,asc"))
                                .andExpect(status().isOk());
        }
}
