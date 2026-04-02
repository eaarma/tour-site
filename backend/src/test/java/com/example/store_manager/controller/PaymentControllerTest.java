package com.example.store_manager.controller;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.PaymentService;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentService paymentService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    MeterRegistry meterRegistry;

    @Test
    void getPaymentLinesForAdmin_returnsOk() throws Exception {
        when(paymentService.searchPaymentLinesForAdmin(
                "12",
                "SUCCEEDED",
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31),
                0,
                10)).thenReturn(Result.ok(new PageImpl<>(List.of(new PaymentLineResponseDto()))));

        mockMvc.perform(get("/payments/admin")
                .param("query", "12")
                .param("status", "SUCCEEDED")
                .param("from", "2026-03-01")
                .param("to", "2026-03-31")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void getByOrderId_returnsOk() throws Exception {
        when(paymentService.getByOrderId(
                eq(1L),
                nullable(Authentication.class)))
                .thenReturn(Result.ok(new PaymentResponseDto()));

        mockMvc.perform(get("/payments/order/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getShopPaymentLines_returnsForbidden_whenServiceRejects() throws Exception {
        when(paymentService.getShopPaymentLines(1L))
                .thenReturn(Result.fail(ApiError.forbidden("Not allowed")));

        mockMvc.perform(get("/payments/shop/1"))
                .andExpect(status().isForbidden());
    }
}
