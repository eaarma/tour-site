package com.example.store_manager.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.store_manager.dto.payout.PayoutCreateRequestDto;
import com.example.store_manager.dto.payout.PayoutResponseDto;
import com.example.store_manager.dto.payout.PayoutShopDetailsDto;
import com.example.store_manager.dto.payout.PayoutShopSummaryDto;
import com.example.store_manager.model.PayoutMethod;
import com.example.store_manager.model.PayoutStatus;
import com.example.store_manager.security.CustomUserDetailsService;
import com.example.store_manager.security.JwtService;
import com.example.store_manager.service.PayoutService;
import com.example.store_manager.utility.Result;

import io.micrometer.core.instrument.MeterRegistry;

@WebMvcTest(controllers = PayoutController.class)
@AutoConfigureMockMvc(addFilters = false)
class PayoutControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private PayoutService payoutService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    MeterRegistry meterRegistry;

    @Test
    void createPayout_returnsOk() throws Exception {
        PayoutCreateRequestDto request = PayoutCreateRequestDto.builder()
                .shopId(1L)
                .periodStart(LocalDate.of(2026, 3, 1))
                .periodEnd(LocalDate.of(2026, 3, 31))
                .method(PayoutMethod.BANK_TRANSFER)
                .reference("BANK-REF-001")
                .notes("Manual March payout")
                .build();

        PayoutResponseDto response = PayoutResponseDto.builder()
                .id(10L)
                .shopId(1L)
                .status(PayoutStatus.COMPLETED)
                .transactionCount(2)
                .currency("EUR")
                .periodStart(LocalDate.of(2026, 3, 1))
                .periodEnd(LocalDate.of(2026, 3, 31))
                .build();

        when(payoutService.createPayout(request)).thenReturn(Result.ok(response));

        mockMvc.perform(post("/payouts/admin")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.periodStart").value("2026-03-01"))
                .andExpect(jsonPath("$.periodEnd").value("2026-03-31"));
    }

    @Test
    void getAdminShopSummaries_returnsOk() throws Exception {
        PayoutShopSummaryDto dto = PayoutShopSummaryDto.builder()
                .currency("EUR")
                .status(PayoutStatus.COMPLETED)
                .payoutStatus(PayoutStatus.COMPLETED)
                .payoutAmount(new java.math.BigDecimal("118.80"))
                .payoutPeriodStart(LocalDate.of(2026, 3, 1))
                .payoutPeriodEnd(LocalDate.of(2026, 3, 31))
                .paidAt(Instant.parse("2026-03-31T12:00:00Z"))
                .periodStart(LocalDate.of(2026, 3, 1))
                .periodEnd(LocalDate.of(2026, 3, 31))
                .build();

        when(payoutService.getAdminShopSummaries(
                "old town",
                "PENDING",
                2026,
                3,
                null,
                null)).thenReturn(Result.ok(List.of(dto)));

        mockMvc.perform(get("/payouts/admin/shops")
                .param("query", "old town")
                .param("status", "PENDING")
                .param("year", "2026")
                .param("month", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].currency").value("EUR"))
                .andExpect(jsonPath("$[0].status").value("COMPLETED"))
                .andExpect(jsonPath("$[0].payoutStatus").value("COMPLETED"))
                .andExpect(jsonPath("$[0].payoutAmount").value(118.80))
                .andExpect(jsonPath("$[0].payoutPeriodStart").value("2026-03-01"))
                .andExpect(jsonPath("$[0].payoutPeriodEnd").value("2026-03-31"))
                .andExpect(jsonPath("$[0].periodStart").value("2026-03-01"))
                .andExpect(jsonPath("$[0].periodEnd").value("2026-03-31"));
    }

    @Test
    void getAdminShopDetails_returnsOk() throws Exception {
        when(payoutService.getAdminShopDetails(
                1L,
                "PENDING",
                null,
                null,
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31)))
                .thenReturn(Result.ok(new PayoutShopDetailsDto()));

        mockMvc.perform(get("/payouts/admin/shops/{shopId}", 1L)
                .param("status", "PENDING")
                .param("from", "2026-03-01")
                .param("to", "2026-03-31"))
                .andExpect(status().isOk());
    }
}
