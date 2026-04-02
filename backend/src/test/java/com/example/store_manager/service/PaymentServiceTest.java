package com.example.store_manager.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.mapper.PaymentLineMapper;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.model.Role;
import com.example.store_manager.model.User;
import com.example.store_manager.security.CustomUserDetails;
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

    @Test
    void getShopPaymentLines_returnsSucceededLinesEvenWhenAlreadyPaidOut() {
        PaymentLine line = new PaymentLine();
        PaymentLineResponseDto dto = new PaymentLineResponseDto();

        when(paymentLineRepository.findSuccessfulByShopId(12L, PaymentStatus.SUCCEEDED))
                .thenReturn(List.of(line));
        when(paymentLineMapper.toDtoList(List.of(line))).thenReturn(List.of(dto));

        Result<List<PaymentLineResponseDto>> result = paymentService.getShopPaymentLines(12L);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertSame(dto, result.get().get(0));
    }

    @Test
    void getByOrderId_returnsOk_whenOrderOwnerAuthenticated() {
        UUID userId = UUID.randomUUID();
        Payment payment = paymentForUser(userId, null);
        PaymentResponseDto dto = new PaymentResponseDto();

        when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(payment));
        when(paymentMapper.toDto(payment)).thenReturn(dto);

        Result<PaymentResponseDto> result = paymentService.getByOrderId(1L, authenticatedUser(userId, "USER"));

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getByOrderId_returnsForbidden_whenUserDoesNotOwnOrder() {
        Payment payment = paymentForUser(UUID.randomUUID(), null);

        when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(payment));

        Result<PaymentResponseDto> result = paymentService.getByOrderId(
                1L,
                authenticatedUser(UUID.randomUUID(), "USER"));

        assertTrue(result.isFail());
        assertEquals("FORBIDDEN", result.error().code());
    }

    @Test
    void getPublicByOrderId_returnsOk_whenReservationTokenMatches() {
        String reservationToken = UUID.randomUUID().toString();
        Payment payment = paymentForUser(null, reservationToken);
        PaymentResponseDto dto = new PaymentResponseDto();

        when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(payment));
        when(paymentMapper.toDto(payment)).thenReturn(dto);

        Result<PaymentResponseDto> result = paymentService.getPublicByOrderId(1L, reservationToken);

        assertTrue(result.isOk());
        assertSame(dto, result.get());
    }

    @Test
    void getPublicByOrderId_returnsNotFound_whenReservationTokenIsInvalid() {
        Payment payment = paymentForUser(null, UUID.randomUUID().toString());

        when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(payment));

        Result<PaymentResponseDto> result = paymentService.getPublicByOrderId(1L, "wrong-token");

        assertTrue(result.isFail());
        assertEquals("NOT_FOUND", result.error().code());
    }

    private Payment paymentForUser(UUID userId, String reservationToken) {
        Order order = new Order();

        if (userId != null) {
            User user = new User();
            user.setId(userId);
            order.setUser(user);
        }

        if (reservationToken != null) {
            order.setReservationToken(UUID.fromString(reservationToken));
        }

        Payment payment = new Payment();
        payment.setId(1L);
        payment.setOrder(order);

        return payment;
    }

    private Authentication authenticatedUser(UUID userId, String role) {
        User user = new User();
        user.setId(userId);
        user.setRole(Role.valueOf(role));

        CustomUserDetails details = new CustomUserDetails(user);

        Authentication auth = org.mockito.Mockito.mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(details);
        return auth;
    }
}
