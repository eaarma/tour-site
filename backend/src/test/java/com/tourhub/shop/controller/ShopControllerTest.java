package com.tourhub.shop.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.tourhub.shop.dto.ShopCreateRequestDto;
import com.tourhub.shop.dto.ShopDto;
import com.tourhub.security.CurrentUserService;
import com.tourhub.security.CustomUserDetailsService;
import com.tourhub.security.JwtAuthenticationFilter;
import com.tourhub.security.JwtService;
import com.tourhub.shop.service.ShopService;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = ShopController.class)
@AutoConfigureMockMvc(addFilters = false)
class ShopControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private ShopService shopService;

        @MockitoBean
        private CurrentUserService currentUserService;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @MockitoBean
        MeterRegistry meterRegistry;

        // ----------------------------
        // Helpers
        // ----------------------------

        private ShopCreateRequestDto validShopDto() {
                return ShopCreateRequestDto.builder()
                                .name("Test Shop")
                                .description("Optional description")
                                .bankAccountName("Test Shop OU")
                                .bankAccountIban("EE123456789012345678")
                                .build();
        }

        // ----------------------------
        // Tests
        // ----------------------------

        @Test
        void createShop_returnsOk_whenServiceSucceeds() throws Exception {
                UUID userId = UUID.randomUUID();

                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                when(shopService.createShop(any(), eq(userId)))
                                .thenReturn(Result.ok(new ShopDto()));

                mockMvc.perform(post("/shops")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validShopDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void createShop_returnsBadRequest_whenServiceFails() throws Exception {
                UUID userId = UUID.randomUUID();

                when(currentUserService.getCurrentUserId())
                                .thenReturn(userId);

                when(shopService.createShop(any(), eq(userId)))
                                .thenReturn(Result.fail(ApiError.badRequest("Invalid shop")));

                mockMvc.perform(post("/shops")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validShopDto())))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void getShop_returnsOk_whenFound() throws Exception {
                when(shopService.getShop(1L))
                                .thenReturn(Result.ok(new ShopDto()));

                mockMvc.perform(get("/shops/{id}", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void getShop_returnsNotFound_whenMissing() throws Exception {
                when(shopService.getShop(1L))
                                .thenReturn(Result.fail(ApiError.notFound("Shop not found")));

                mockMvc.perform(get("/shops/{id}", 1L))
                                .andExpect(status().isNotFound());
        }

        @Test
        void updateShop_returnsOk_whenSuccess() throws Exception {
                when(shopService.updateShop(eq(1L), any()))
                                .thenReturn(Result.ok(new ShopDto()));

                mockMvc.perform(put("/shops/{id}", 1L)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(validShopDto())))
                                .andExpect(status().isOk());
        }

        @Test
        void removeShop_returnsOk_whenSuccess() throws Exception {
                when(shopService.removeShop(1L))
                                .thenReturn(Result.ok());

                mockMvc.perform(patch("/shops/{id}/remove", 1L))
                                .andExpect(status().isOk());
        }

        @Test
        void removeShop_returnsForbidden_whenServiceRejects() throws Exception {
                when(shopService.removeShop(1L))
                                .thenReturn(Result.fail(ApiError.forbidden("Only admins or shop owners can remove shops")));

                mockMvc.perform(patch("/shops/{id}/remove", 1L))
                                .andExpect(status().isForbidden());
        }

        @Test
        void getAllShops_returnsOk() throws Exception {

                Page<ShopDto> page = new PageImpl<>(List.of(new ShopDto()));

                when(shopService.searchShops(
                                any(),
                                any(),
                                anyInt(),
                                anyInt())).thenReturn(Result.ok(page));

                mockMvc.perform(get("/shops")
                                .param("query", "")
                                .param("status", "ACTIVE")
                                .param("page", "0")
                                .param("size", "10"))
                                .andExpect(status().isOk());
        }

}


