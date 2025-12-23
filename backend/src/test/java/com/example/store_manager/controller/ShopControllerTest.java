package com.example.store_manager.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.dto.shop.ShopCreateRequestDto;
import com.example.store_manager.dto.shop.ShopDto;
import com.example.store_manager.security.CurrentUserService;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtAuthenticationFilter;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.ShopService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

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

        // ----------------------------
        // Helpers
        // ----------------------------

        private ShopCreateRequestDto validShopDto() {
                return ShopCreateRequestDto.builder()
                                .name("Test Shop")
                                .description("Optional description")
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
        void getAllShops_returnsOk() throws Exception {
                when(shopService.getAllShops())
                                .thenReturn(Result.ok(List.of(new ShopDto())));

                mockMvc.perform(get("/shops"))
                                .andExpect(status().isOk());
        }

}
