package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.mapper.PaymentLineMapper;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.repository.PaymentLineRepository;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import com.example.store_manager.utility.Result;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentLineRepository paymentLineRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private PaymentLineMapper paymentLineMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private TourScheduleRepository tourScheduleRepository;

    @Mock
    private BookingAccessTokenService bookingAccessTokenService;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void searchPaymentLinesForAdmin_returnsPagedResults_whenFiltersAreValid() {
        PaymentLine line = new PaymentLine();
        PaymentLineResponseDto dto = new PaymentLineResponseDto();
        Page<PaymentLine> page = new PageImpl<>(List.of(line));

        when(paymentLineRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(paymentLineMapper.toDto(line)).thenReturn(dto);

        Result<Page<PaymentLineResponseDto>> result = paymentService.searchPaymentLinesForAdmin(
                "12",
                "SUCCEEDED",
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31),
                0,
                10);

        assertTrue(result.isOk());
        assertEquals(1, result.get().getContent().size());
        assertSame(dto, result.get().getContent().get(0));
    }

    @Test
    void searchPaymentLinesForAdmin_returnsFail_whenDateRangeInvalid() {
        Result<Page<PaymentLineResponseDto>> result = paymentService.searchPaymentLinesForAdmin(
                null,
                null,
                LocalDate.of(2026, 3, 31),
                LocalDate.of(2026, 3, 1),
                0,
                10);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }
}
