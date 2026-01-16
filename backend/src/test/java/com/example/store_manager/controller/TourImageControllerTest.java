package com.example.store_manager.controller;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.store_manager.model.TourImage;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.TourImageService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(TourImageController.class)
@AutoConfigureMockMvc(addFilters = false)
class TourImageControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private TourImageService tourImageService;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @MockitoBean
        MeterRegistry meterRegistry;

        // ----------------------------
        // Helpers
        // ----------------------------

        private TourImage tourImage(Long id) {
                TourImage image = new TourImage();
                image.setId(id);
                image.setImageUrl("https://example.com/image.jpg");
                image.setPosition(0);
                return image;
        }

        // ----------------------------
        // Tests
        // ----------------------------

        @Test
        void getTourImages_returnsOk() throws Exception {
                when(tourImageService.getImagesByTour(1L))
                                .thenReturn(Result.ok(List.of(tourImage(1L))));

                mockMvc.perform(get("/api/tours/{tourId}/images", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void addImage_returnsOk_whenValid() throws Exception {
                Map<String, String> body = Map.of("imageUrl", "https://example.com/image.jpg");

                when(tourImageService.addImageToTour(1L, body.get("imageUrl")))
                                .thenReturn(Result.ok(tourImage(1L)));

                mockMvc.perform(post("/api/tours/{tourId}/images", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isOk());
        }

        @Test
        void addImage_returnsBadRequest_whenMissingImageUrl() throws Exception {
                Map<String, String> body = Map.of();

                mockMvc.perform(post("/api/tours/{tourId}/images", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void addImage_returnsNotFound_whenTourMissing() throws Exception {
                Map<String, String> body = Map.of("imageUrl", "https://example.com/image.jpg");

                when(tourImageService.addImageToTour(1L, body.get("imageUrl")))
                                .thenReturn(Result.fail(ApiError.notFound("Tour not found")));

                mockMvc.perform(post("/api/tours/{tourId}/images", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(body)))
                                .andExpect(status().isNotFound());
        }

        @Test
        void deleteImage_returnsOk() throws Exception {
                when(tourImageService.deleteImage(1L, 10L))
                                .thenReturn(Result.ok(true));

                mockMvc.perform(delete("/api/tours/{tourId}/images/{imageId}", 1L, 10L))
                                .andExpect(status().isOk());
        }

        @Test
        void deleteImage_returnsNotFound_whenMissing() throws Exception {
                when(tourImageService.deleteImage(1L, 10L))
                                .thenReturn(Result.fail(ApiError.notFound("Image not found")));

                mockMvc.perform(delete("/api/tours/{tourId}/images/{imageId}", 1L, 10L))
                                .andExpect(status().isNotFound());
        }

        @Test
        void reorderImages_returnsOk() throws Exception {
                List<Long> orderedIds = List.of(3L, 1L, 2L);

                when(tourImageService.updateImageOrder(1L, orderedIds))
                                .thenReturn(Result.ok(true));

                mockMvc.perform(put("/api/tours/{tourId}/images/reorder", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(orderedIds)))
                                .andExpect(status().isOk());
        }
}
