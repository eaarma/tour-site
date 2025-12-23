package com.example.store_manager.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.order.StatusUpdateRequestDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtAuthenticationFilter;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.OrderService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    void getOrderById_returnsOk_whenFound() throws Exception {
        when(orderService.getOrderById(1L))
                .thenReturn(Result.ok(new OrderResponseDto()));

        mockMvc.perform(get("/orders/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getOrderById_returnsNotFound_whenMissing() throws Exception {
        when(orderService.getOrderById(1L))
                .thenReturn(Result.fail(ApiError.notFound("Order not found")));

        mockMvc.perform(get("/orders/1"))
                .andExpect(status().isNotFound());
    }

    /* ---------------- GUEST ORDER VIEW ---------------- */

    @Test
    void getGuestOrder_stripsSensitiveFields_andReturnsOk() throws Exception {
        OrderItemResponseDto item = new OrderItemResponseDto();
        item.setEmail("test@example.com");
        item.setPhone("+123");

        OrderResponseDto response = new OrderResponseDto();
        response.setItems(List.of(item));

        when(orderService.getOrderById(1L))
                .thenReturn(Result.ok(response));

        mockMvc.perform(get("/orders/guest/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].email").doesNotExist())
                .andExpect(jsonPath("$.items[0].phone").doesNotExist());
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
