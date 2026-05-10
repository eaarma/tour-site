package com.tourhub.order.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.tourhub.order.dto.OrderCreateRequestDto;
import com.tourhub.order.dto.OrderItemCreateRequestDto;
import com.tourhub.order.dto.OrderItemResponseDto;
import com.tourhub.order.dto.OrderResponseDto;
import com.tourhub.order.dto.StatusUpdateRequestDto;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.security.CustomUserDetailsService;
import com.tourhub.security.JwtAuthenticationFilter;
import com.tourhub.security.JwtService;
import com.tourhub.order.service.CancellationService;
import com.tourhub.order.service.OrderService;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = OrderController.class)
@AutoConfigureMockMvc(addFilters = false)
class OrderControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private OrderService orderService;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @MockitoBean
        private CancellationService cancellationService;

        @MockitoBean
        private PaymentLineRepository paymentLineRepository;

        @MockitoBean
        MeterRegistry meterRegistry;

        /* ---------------- CREATE ORDER ---------------- */

        @Test
        void createOrder_returnsOk_whenServiceSucceeds() throws Exception {
                OrderCreateRequestDto dto = validOrderCreateDto();

                when(orderService.createOrder(any(), any()))
                                .thenReturn(Result.ok(new OrderResponseDto()));

                mockMvc.perform(post("/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        @Test
        void createOrder_returnsBadRequest_whenValidationFails() throws Exception {
                mockMvc.perform(post("/orders")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isBadRequest());
        }

        /* ---------------- GET ORDER ---------------- */

        @Test
        void getOrdersForAdmin_returnsOk_whenServiceSucceeds() throws Exception {
                when(orderService.searchOrdersForAdmin(
                                nullable(String.class),
                                nullable(String.class),
                                nullable(LocalDate.class),
                                nullable(LocalDate.class),
                                eq(0),
                                eq(10)))
                                .thenReturn(Result.ok(new PageImpl<>(List.of(new OrderResponseDto()))));

                mockMvc.perform(get("/orders/admin"))
                                .andExpect(status().isOk());
        }

        @Test
        void getOrderById_returnsOk_whenFound() throws Exception {

                when(orderService.getOrderById(
                                eq(1L),
                                nullable(Authentication.class),
                                nullable(String.class)))
                                .thenReturn(Result.ok(new OrderResponseDto()));

                mockMvc.perform(get("/orders/1"))
                                .andExpect(status().isOk());
        }

        @Test
        void getOrderById_returnsNotFound_whenMissing() throws Exception {

                when(orderService.getOrderById(
                                eq(1L),
                                nullable(Authentication.class),
                                nullable(String.class)))
                                .thenReturn(Result.fail(ApiError.notFound("Order not found")));

                mockMvc.perform(get("/orders/1"))
                                .andExpect(status().isNotFound());
        }
        /* ---------------- USER ORDERS ---------------- */

        @Test
        void getUserOrders_returnsOk() throws Exception {
                when(orderService.getOrdersByUser(any()))
                                .thenReturn(Result.ok(List.of()));

                mockMvc.perform(get("/orders"))
                                .andExpect(status().isOk());
        }

        /* ---------------- ORDER ITEMS ---------------- */

        @Test
        void getOrderItem_returnsOk_whenFound() throws Exception {
                when(orderService.getOrderItemById(1L))
                                .thenReturn(Result.ok(new OrderItemResponseDto()));

                mockMvc.perform(get("/orders/items/1"))
                                .andExpect(status().isOk());
        }

        @Test
        void updateOrderItemStatus_returnsOk_whenSuccess() throws Exception {
                StatusUpdateRequestDto dto = new StatusUpdateRequestDto();
                dto.setStatus(OrderStatus.CONFIRMED);

                when(orderService.updateOrderItemStatus(1L, OrderStatus.CONFIRMED))
                                .thenReturn(Result.ok(new OrderItemResponseDto()));

                mockMvc.perform(patch("/orders/items/1/status")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        /* ---------------- MANAGER / SHOP ---------------- */

        @Test
        void getOrderItemsByShop_returnsOk() throws Exception {
                when(orderService.getOrderItemsByShop(1L))
                                .thenReturn(Result.ok(List.of()));

                mockMvc.perform(get("/orders/shop/1/items"))
                                .andExpect(status().isOk());
        }

        @Test
        void getOrderItemsByManager_returnsOk() throws Exception {
                UUID managerId = UUID.randomUUID();

                when(orderService.getOrderItemsByManager(managerId))
                                .thenReturn(Result.ok(List.of()));

                mockMvc.perform(get("/orders/manager/" + managerId + "/items"))
                                .andExpect(status().isOk());
        }

        /* ---------------- GUEST CHECKOUT ---------------- */

        @Test
        void createGuestOrder_returnsOk_whenSuccess() throws Exception {
                OrderCreateRequestDto dto = validOrderCreateDto();

                when(orderService.createOrder(any(), isNull()))
                                .thenReturn(Result.ok(new OrderResponseDto()));

                mockMvc.perform(post("/orders/guest")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(dto)))
                                .andExpect(status().isOk());
        }

        private OrderCreateRequestDto validOrderCreateDto() {
                OrderItemCreateRequestDto item = OrderItemCreateRequestDto.builder()
                                .tourId(1L)
                                .scheduleId(10L)
                                .scheduledAt(LocalDateTime.now().plusDays(1))
                                .participants(2)
                                .preferredLanguage("EN")
                                .comment("Test booking")
                                .build();

                return OrderCreateRequestDto.builder()
                                .items(List.of(item))
                                .paymentMethod("CARD")
                                .name("John Doe")
                                .email("john.doe@example.com")
                                .phone("+1234567890")
                                .nationality("US")
                                .build();
        }

}


