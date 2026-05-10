package com.tourhub.payment.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.tourhub.payment.dto.PaymentResponseDto;
import com.tourhub.security.CustomUserDetailsService;
import com.tourhub.security.JwtService;
import com.tourhub.payment.service.PaymentService;
import com.tourhub.common.result.Result;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = PublicPaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PublicPaymentControllerTest {

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
    void getByOrderId_returnsOk() throws Exception {
        when(paymentService.getPublicByOrderId(1L, "token-123"))
                .thenReturn(Result.ok(new PaymentResponseDto()));

        mockMvc.perform(get("/public/payments/order/1")
                .param("token", "token-123"))
                .andExpect(status().isOk());
    }
}


