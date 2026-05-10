package com.tourhub.payout.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.tourhub.payout.dto.PayoutCreateRequestDto;
import com.tourhub.payout.dto.PayoutSessionDetailsDto;
import com.tourhub.payout.dto.PayoutResponseDto;
import com.tourhub.payout.dto.PayoutSessionSummaryDto;
import com.tourhub.payout.dto.PayoutShopDetailsDto;
import com.tourhub.payout.dto.PayoutShopSummaryDto;
import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.payment.model.PaymentLine;
import com.tourhub.payment.model.PaymentLineType;
import com.tourhub.payment.model.PaymentStatus;
import com.tourhub.payout.model.Payout;
import com.tourhub.payout.model.PayoutMethod;
import com.tourhub.payout.model.PayoutStatus;
import com.tourhub.shop.model.Shop;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.session.model.TourSession;
import com.tourhub.user.model.User;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.payout.repository.PayoutRepository;
import com.tourhub.shop.repository.ShopRepository;
import com.tourhub.common.result.Result;

@ExtendWith(MockitoExtension.class)
class PayoutServiceTest {

    @Mock
    private PaymentLineRepository paymentLineRepository;

    @Mock
    private PayoutRepository payoutRepository;

    @Mock
    private ShopRepository shopRepository;

    @InjectMocks
    private PayoutService payoutService;

    @Test
    void getAdminShopSummaries_groupsLinesByShop() {
        PaymentLine saleLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("100.00"));
        PaymentLine refundLine = buildOrderLine(1L, 10L, PaymentLineType.REFUND, new BigDecimal("-20.00"));
        PaymentLine feeLine = buildSessionFeeLine(1L, 10L, new BigDecimal("-5.00"));

        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(saleLine, refundLine, feeLine));
        when(shopRepository.findAllById(anyList()))
                .thenReturn(List.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));

        Result<List<PayoutShopSummaryDto>> result = payoutService.getAdminShopSummaries(
                "old town",
                "PENDING",
                2026,
                3,
                null,
                null);

        assertTrue(result.isOk());
        assertEquals(1, result.get().size());
        assertEquals("Old Town Adventures", result.get().get(0).getShopName());
        assertEquals("Old Town Adventures OU", result.get().get(0).getBankAccountName());
        assertEquals("EE123456789012345678", result.get().get(0).getBankAccountIban());
        assertEquals("EUR", result.get().get(0).getCurrency());
        assertEquals(PayoutStatus.PENDING, result.get().get(0).getStatus());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().get(0).getPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().get(0).getPeriodEnd());
        assertEquals(3, result.get().get(0).getTransactionCount());
        assertEquals(new BigDecimal("75.00"), result.get().get(0).getTotalAmount());
    }

    @Test
    void getAdminShopDetails_groupsLinesBySession() {
        PaymentLine saleLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("100.00"));
        PaymentLine refundLine = buildOrderLine(1L, 10L, PaymentLineType.REFUND, new BigDecimal("-20.00"));
        PaymentLine feeLine = buildSessionFeeLine(1L, 10L, new BigDecimal("-5.00"));

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));
        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(saleLine, refundLine, feeLine));
        when(payoutRepository.findAllForShop(1L)).thenReturn(List.of());

        Result<PayoutShopDetailsDto> result = payoutService.getAdminShopDetails(
                1L,
                "PENDING",
                2026,
                3,
                null,
                null);

        assertTrue(result.isOk());
        assertEquals("Old Town Adventures", result.get().getShopName());
        assertEquals("Old Town Adventures OU", result.get().getBankAccountName());
        assertEquals("EE123456789012345678", result.get().getBankAccountIban());
        assertEquals("EUR", result.get().getCurrency());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().getPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().getPeriodEnd());
        assertEquals(3, result.get().getTransactionCount());
        assertEquals(0, result.get().getPayouts().size());
        assertEquals(1, result.get().getSessionGroups().size());
        assertEquals(3, result.get().getSessionGroups().get(0).getRows().size());
        assertEquals("Order item income", result.get().getSessionGroups().get(0).getRows().get(0).getLabel());
    }

    @Test
    void getAdminShopSummaries_groupsByMonth_whenYearHasAllMonths() {
        PaymentLine marchLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("100.00"));
        PaymentLine aprilLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("80.00"));
        aprilLine.setId(3000L);
        aprilLine.setCreatedAt(Instant.parse("2026-04-15T10:00:00Z"));

        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(aprilLine, marchLine));
        when(shopRepository.findAllById(anyList()))
                .thenReturn(List.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));

        Result<List<PayoutShopSummaryDto>> result = payoutService.getAdminShopSummaries(
                null,
                "PENDING",
                2026,
                null,
                null,
                null);

        assertTrue(result.isOk());
        assertEquals(2, result.get().size());
        assertEquals(LocalDate.of(2026, 4, 1), result.get().get(0).getPeriodStart());
        assertEquals(LocalDate.of(2026, 4, 30), result.get().get(0).getPeriodEnd());
        assertEquals(PayoutStatus.PENDING, result.get().get(0).getStatus());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().get(1).getPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().get(1).getPeriodEnd());
    }

    @Test
    void getManagerSessionSummaries_groupsSameSessionSeparatelyPerMonth() {
        PaymentLine marchLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("100.00"));
        PaymentLine aprilLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("80.00"));
        aprilLine.setId(3000L);
        aprilLine.setCreatedAt(Instant.parse("2026-04-15T10:00:00Z"));

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder().id(1L).name("Old Town Adventures").build()));
        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(aprilLine, marchLine));

        Result<List<PayoutSessionSummaryDto>> result = payoutService.getManagerSessionSummaries(
                1L,
                "harbor",
                "PENDING",
                2026,
                null);

        assertTrue(result.isOk());
        assertEquals(2, result.get().size());
        assertEquals(LocalDate.of(2026, 4, 1), result.get().get(0).getPeriodStart());
        assertEquals(LocalDate.of(2026, 4, 30), result.get().get(0).getPeriodEnd());
        assertEquals(10L, result.get().get(0).getSessionId());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().get(1).getPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().get(1).getPeriodEnd());
        assertEquals(10L, result.get().get(1).getSessionId());
    }

    @Test
    void getManagerSessionDetails_returnsRowsForSelectedSessionAndPeriod() {
        PaymentLine saleLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("100.00"));
        PaymentLine refundLine = buildOrderLine(1L, 10L, PaymentLineType.REFUND, new BigDecimal("-20.00"));

        User manager = User.builder().name("Alice Manager").build();
        saleLine.getOrderItem().getSession().setManager(manager);
        refundLine.getOrderItem().getSession().setManager(manager);

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder().id(1L).name("Old Town Adventures").build()));
        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(saleLine, refundLine));

        Result<PayoutSessionDetailsDto> result = payoutService.getManagerSessionDetails(
                1L,
                10L,
                "PENDING",
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31));

        assertTrue(result.isOk());
        assertEquals(10L, result.get().getSessionId());
        assertEquals("Harbor Walk", result.get().getSessionTitle());
        assertEquals("Alice Manager", result.get().getManagerName());
        assertEquals(2, result.get().getTransactionCount());
        assertEquals(new BigDecimal("80.00"), result.get().getTotalAmount());
        assertEquals(2, result.get().getRows().size());
        assertEquals("Order item income", result.get().getRows().get(0).getLabel());
    }

    @Test
    void getAdminShopDetails_returnsActualPayoutAmountAndPeriod_fromPayoutEntry() {
        PaymentLine marchPaidLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("118.80"));
        marchPaidLine.setPayout(Payout.builder()
                .id(77L)
                .status(PayoutStatus.COMPLETED)
                .totalAmount(new BigDecimal("118.80"))
                .paidAt(Instant.parse("2026-03-31T12:00:00Z"))
                .periodStart(Instant.parse("2026-03-01T00:00:00Z"))
                .periodEnd(Instant.parse("2026-03-31T23:59:59Z"))
                .build());

        PaymentLine aprilOpenLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("1665.00"));
        aprilOpenLine.setId(4000L);
        aprilOpenLine.setCreatedAt(Instant.parse("2026-04-10T10:00:00Z"));

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));
        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(aprilOpenLine, marchPaidLine));

        Result<PayoutShopDetailsDto> result = payoutService.getAdminShopDetails(
                1L,
                null,
                null,
                null,
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 4, 30));

        assertTrue(result.isOk());
        assertEquals(new BigDecimal("1783.80"), result.get().getTotalAmount());
        assertEquals(77L, result.get().getPayoutId());
        assertEquals(PayoutStatus.COMPLETED, result.get().getPayoutStatus());
        assertEquals(new BigDecimal("118.80"), result.get().getPayoutAmount());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().getPayoutPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().getPayoutPeriodEnd());
    }

    @Test
    void getAdminShopSummaries_returnsFail_whenDateRangeInvalid() {
        Result<List<PayoutShopSummaryDto>> result = payoutService.getAdminShopSummaries(
                null,
                null,
                null,
                null,
                LocalDate.of(2026, 4, 30),
                LocalDate.of(2026, 4, 1));

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
    }

    @Test
    void getAdminShopDetails_includesAllPayoutsWithinViewedPeriod() {
        PaymentLine aprilOpenLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("1665.00"));
        aprilOpenLine.setId(4000L);
        aprilOpenLine.setCreatedAt(Instant.parse("2026-04-10T10:00:00Z"));

        Payout marchPayout = Payout.builder()
                .id(77L)
                .shopId(1L)
                .status(PayoutStatus.COMPLETED)
                .totalAmount(new BigDecimal("118.80"))
                .transactionCount(2)
                .currency("EUR")
                .method(PayoutMethod.BANK_TRANSFER)
                .paidAt(Instant.parse("2026-03-31T12:00:00Z"))
                .createdAt(Instant.parse("2026-03-31T12:00:00Z"))
                .periodStart(Instant.parse("2026-03-01T00:00:00Z"))
                .periodEnd(Instant.parse("2026-03-31T23:59:59Z"))
                .build();
        Payout mayPayout = Payout.builder()
                .id(88L)
                .shopId(1L)
                .status(PayoutStatus.COMPLETED)
                .totalAmount(new BigDecimal("200.00"))
                .transactionCount(1)
                .currency("EUR")
                .method(PayoutMethod.CASH)
                .paidAt(Instant.parse("2026-05-02T09:00:00Z"))
                .createdAt(Instant.parse("2026-05-02T09:00:00Z"))
                .periodStart(Instant.parse("2026-04-01T00:00:00Z"))
                .periodEnd(Instant.parse("2026-04-30T23:59:59Z"))
                .build();

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));
        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(aprilOpenLine));
        when(payoutRepository.findAllForShop(1L))
                .thenReturn(List.of(mayPayout, marchPayout));

        Result<PayoutShopDetailsDto> result = payoutService.getAdminShopDetails(
                1L,
                null,
                null,
                null,
                null,
                null);

        assertTrue(result.isOk());
        assertEquals(new BigDecimal("1665.00"), result.get().getTotalAmount());
        assertEquals(2, result.get().getPayouts().size());
        assertEquals(77L, result.get().getPayouts().get(1).getId());
        assertEquals(new BigDecimal("118.80"), result.get().getPayouts().get(1).getTotalAmount());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().getPayouts().get(1).getPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().getPayouts().get(1).getPeriodEnd());
    }

    @Test
    void getAdminShopDetails_filtersPayoutHistoryByPayoutPeriodOverlap() {
        PaymentLine aprilOpenLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("1665.00"));
        aprilOpenLine.setId(4000L);
        aprilOpenLine.setCreatedAt(Instant.parse("2026-04-10T10:00:00Z"));

        Payout marchPayout = Payout.builder()
                .id(77L)
                .shopId(1L)
                .status(PayoutStatus.COMPLETED)
                .totalAmount(new BigDecimal("118.80"))
                .transactionCount(2)
                .currency("EUR")
                .method(PayoutMethod.BANK_TRANSFER)
                .paidAt(Instant.parse("2026-05-05T12:00:00Z"))
                .createdAt(Instant.parse("2026-05-05T12:00:00Z"))
                .periodStart(Instant.parse("2026-03-01T00:00:00Z"))
                .periodEnd(Instant.parse("2026-03-31T23:59:59Z"))
                .build();
        Payout mayPayout = Payout.builder()
                .id(88L)
                .shopId(1L)
                .status(PayoutStatus.COMPLETED)
                .totalAmount(new BigDecimal("200.00"))
                .transactionCount(1)
                .currency("EUR")
                .method(PayoutMethod.CASH)
                .paidAt(Instant.parse("2026-05-02T09:00:00Z"))
                .createdAt(Instant.parse("2026-05-02T09:00:00Z"))
                .periodStart(Instant.parse("2026-04-01T00:00:00Z"))
                .periodEnd(Instant.parse("2026-04-30T23:59:59Z"))
                .build();

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));
        when(paymentLineRepository.findAll(any(Specification.class), any(Sort.class)))
                .thenReturn(List.of(aprilOpenLine));
        when(payoutRepository.findAllForShop(1L))
                .thenReturn(List.of(mayPayout, marchPayout));

        Result<PayoutShopDetailsDto> result = payoutService.getAdminShopDetails(
                1L,
                null,
                null,
                null,
                LocalDate.of(2026, 3, 1),
                LocalDate.of(2026, 3, 31));

        assertTrue(result.isOk());
        assertEquals(1, result.get().getPayouts().size());
        assertEquals(77L, result.get().getPayouts().get(0).getId());
        assertEquals(new BigDecimal("118.80"), result.get().getPayouts().get(0).getTotalAmount());
    }

    @Test
    void createPayout_createsCompletedPayout_andAssignsLines() {
        PaymentLine saleLine = buildOrderLine(1L, 10L, PaymentLineType.SALE, new BigDecimal("100.00"));
        PaymentLine refundLine = buildOrderLine(1L, 10L, PaymentLineType.REFUND, new BigDecimal("-20.00"));
        refundLine.setId(1001L);

        PayoutCreateRequestDto request = PayoutCreateRequestDto.builder()
                .shopId(1L)
                .periodStart(LocalDate.of(2026, 3, 1))
                .periodEnd(LocalDate.of(2026, 3, 31))
                .method(PayoutMethod.BANK_TRANSFER)
                .reference("BANK-REF-001")
                .notes("Manual March payout")
                .build();

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder()
                        .id(1L)
                        .name("Old Town Adventures")
                        .bankAccountName("Old Town Adventures OU")
                        .bankAccountIban("EE123456789012345678")
                        .build()));
        when(paymentLineRepository.findEligibleForPayout(
                anyLong(),
                any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of(saleLine, refundLine));
        when(payoutRepository.save(any(Payout.class)))
                .thenAnswer(invocation -> {
                    Payout payout = invocation.getArgument(0);
                    payout.setId(55L);
                    payout.setCreatedAt(Instant.parse("2026-03-31T12:00:00Z"));
                    return payout;
                });

        Result<PayoutResponseDto> result = payoutService.createPayout(request);

        assertTrue(result.isOk());
        assertEquals(55L, result.get().getId());
        assertEquals(new BigDecimal("80.00"), result.get().getTotalAmount());
        assertEquals(2, result.get().getTransactionCount());
        assertEquals("EUR", result.get().getCurrency());
        assertEquals(PayoutMethod.BANK_TRANSFER, result.get().getMethod());
        assertEquals(PayoutStatus.COMPLETED, result.get().getStatus());
        assertEquals(LocalDate.of(2026, 3, 1), result.get().getPeriodStart());
        assertEquals(LocalDate.of(2026, 3, 31), result.get().getPeriodEnd());
        assertEquals("Old Town Adventures OU", result.get().getBankAccountName());
        assertEquals("EE123456789012345678", result.get().getBankAccountIban());
        assertTrue(saleLine.getPayout() != null);
        assertTrue(refundLine.getPayout() != null);
        assertEquals(55L, saleLine.getPayout().getId());
        assertEquals(55L, refundLine.getPayout().getId());
    }

    @Test
    void createPayout_returnsFail_whenNoEligibleLinesFound() {
        PayoutCreateRequestDto request = PayoutCreateRequestDto.builder()
                .shopId(1L)
                .periodStart(LocalDate.of(2026, 3, 1))
                .periodEnd(LocalDate.of(2026, 3, 31))
                .method(PayoutMethod.CASH)
                .build();

        when(shopRepository.findById(1L))
                .thenReturn(Optional.of(Shop.builder().id(1L).name("Old Town Adventures").build()));
        when(paymentLineRepository.findEligibleForPayout(
                anyLong(),
                any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of());

        Result<PayoutResponseDto> result = payoutService.createPayout(request);

        assertTrue(result.isFail());
        assertEquals("BAD_REQUEST", result.error().code());
        assertEquals("No eligible payment lines found for the selected payout window", result.error().message());
    }

    private PaymentLine buildOrderLine(Long shopId, Long sessionId, PaymentLineType type, BigDecimal amount) {
        Tour tour = Tour.builder().id(500L).title("Harbor Walk").build();
        TourSchedule schedule = TourSchedule.builder()
                .date(LocalDate.of(2026, 3, 12))
                .time(LocalTime.of(10, 0))
                .tour(tour)
                .build();
        TourSession session = TourSession.builder()
                .id(sessionId)
                .schedule(schedule)
                .build();
        Order order = Order.builder().id(700L).build();
        OrderItem item = OrderItem.builder()
                .id(900L + type.ordinal())
                .order(order)
                .tourTitle("Harbor Walk")
                .participants(4)
                .scheduledAt(LocalDateTime.of(2026, 3, 12, 10, 0))
                .session(session)
                .build();

        return PaymentLine.builder()
                .id(1000L + type.ordinal())
                .shopId(shopId)
                .orderItem(item)
                .type(type)
                .grossAmount(amount)
                .platformFee(BigDecimal.ZERO)
                .shopAmount(amount)
                .currency("EUR")
                .status(PaymentStatus.SUCCEEDED)
                .createdAt(Instant.parse("2026-03-15T10:00:00Z"))
                .build();
    }

    private PaymentLine buildSessionFeeLine(Long shopId, Long sessionId, BigDecimal amount) {
        Tour tour = Tour.builder().id(500L).title("Harbor Walk").build();
        TourSchedule schedule = TourSchedule.builder()
                .date(LocalDate.of(2026, 3, 12))
                .time(LocalTime.of(10, 0))
                .tour(tour)
                .build();
        TourSession session = TourSession.builder()
                .id(sessionId)
                .schedule(schedule)
                .build();

        return PaymentLine.builder()
                .id(2000L)
                .shopId(shopId)
                .session(session)
                .type(PaymentLineType.CANCELLATION_FEE)
                .grossAmount(amount)
                .platformFee(BigDecimal.ZERO)
                .shopAmount(amount)
                .currency("EUR")
                .status(PaymentStatus.SUCCEEDED)
                .createdAt(Instant.parse("2026-03-16T12:00:00Z"))
                .build();
    }
}

