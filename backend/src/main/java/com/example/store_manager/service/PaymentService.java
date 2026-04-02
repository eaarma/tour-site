package com.example.store_manager.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.payment.PaymentLineResponseDto;
import com.example.store_manager.dto.payment.PaymentResponseDto;
import com.example.store_manager.mapper.PaymentLineMapper;
import com.example.store_manager.mapper.PaymentMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentLine;
import com.example.store_manager.model.PaymentLineType;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.repository.PaymentLineRepository;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import com.example.store_manager.security.CustomUserDetails;
import com.example.store_manager.security.annotations.AccessLevel;
import com.example.store_manager.security.annotations.ShopAccess;
import com.example.store_manager.security.annotations.ShopIdSource;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal PLATFORM_RATE = new BigDecimal("0.10");

    private final PaymentRepository paymentRepository;
    private final PaymentLineRepository paymentLineRepository;
    private final PaymentMapper paymentMapper;
    private final PaymentLineMapper paymentLineMapper;
    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private final EmailService emailService;
    private final TourScheduleRepository tourScheduleRepository;
    private final BookingAccessTokenService bookingAccessTokenService;

    @Transactional(readOnly = true)
    public Result<Page<PaymentLineResponseDto>> searchPaymentLinesForAdmin(
            String query,
            String status,
            LocalDate from,
            LocalDate to,
            int page,
            int size) {

        if (from != null && to != null && from.isAfter(to)) {
            return Result.fail(ApiError.badRequest("'From' date must be before or equal to 'To' date"));
        }

        String normalizedQuery = normalizeQuery(query);
        PaymentStatus normalizedStatus = normalizeStatus(status);

        if (status != null && !status.isBlank() && normalizedStatus == null) {
            return Result.fail(ApiError.badRequest("Invalid payment status"));
        }

        Instant createdFrom = from != null
                ? from.atStartOfDay(ZoneId.of("UTC")).toInstant()
                : null;

        Instant createdTo = to != null
                ? to.plusDays(1).atStartOfDay(ZoneId.of("UTC")).toInstant()
                : null;

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")));

        Page<PaymentLine> result = paymentLineRepository.findAll(
                buildAdminPaymentLineSpecification(normalizedQuery, normalizedStatus, createdFrom, createdTo),
                pageable);

        return Result.ok(result.map(paymentLineMapper::toDto));
    }

    @Transactional
    public Payment createPendingForOrder(Order order) {

        BigDecimal totalFee = BigDecimal.ZERO;

        Payment payment = Payment.builder()
                .order(order)
                .amountTotal(order.getTotalPrice())
                .platformFee(BigDecimal.ZERO)
                .currency("EUR")
                .status(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepository.save(payment);

        for (OrderItem item : order.getOrderItems()) {

            BigDecimal gross = item.getPricePaid();

            BigDecimal fee = gross.multiply(PLATFORM_RATE)
                    .setScale(2, RoundingMode.HALF_UP);

            BigDecimal shopAmount = gross.subtract(fee);

            totalFee = totalFee.add(fee);

            PaymentLine line = PaymentLine.builder()
                    .payment(saved)
                    .orderItem(item)
                    .shopId(item.getShopId())
                    .type(PaymentLineType.SALE)
                    .grossAmount(gross)
                    .platformFee(fee)
                    .shopAmount(shopAmount)
                    .currency("EUR")
                    .status(PaymentStatus.PENDING)
                    .build();

            paymentLineRepository.save(line);
        }

        saved.setPlatformFee(totalFee);

        return paymentRepository.save(saved);
    }

    @Transactional
    public Result<Void> markPaymentSucceeded(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalStateException(
                        "Payment not found: " + paymentId));

        if (payment.getStatus() == PaymentStatus.SUCCEEDED) {
            return Result.ok();
        }

        payment.setStatus(PaymentStatus.SUCCEEDED);

        for (PaymentLine line : payment.getPaymentLines()) {
            line.setStatus(PaymentStatus.SUCCEEDED);
        }

        Order order = payment.getOrder();

        // =============================
        // EXISTING SCHEDULE LOGIC
        // =============================

        for (OrderItem item : order.getOrderItems()) {
            TourSchedule schedule = tourScheduleRepository
                    .findByIdForUpdate(item.getSchedule().getId())
                    .orElseThrow(() -> new IllegalStateException("Schedule not found"));

            int qty = item.getParticipants();

            schedule.releaseReserved(qty);

            int newBooked = (schedule.getBookedParticipants() == null ? 0 : schedule.getBookedParticipants()) + qty;
            schedule.setBookedParticipants(newBooked);

            Tour tour = item.getTour();
            if ("PRIVATE".equalsIgnoreCase(tour.getType()) || newBooked >= schedule.getMaxParticipants()) {
                schedule.setStatus("BOOKED");
            } else {
                schedule.setStatus("ACTIVE");
            }
        }

        order.setStatus(OrderStatus.PAID);

        for (OrderItem item : order.getOrderItems()) {
            item.setStatus(OrderStatus.PAID);
        }

        // =============================
        // NEW: GENERATE MANAGE TOKEN
        // =============================

        if (order.getCancellationTokenHash() == null) {

            var generated = bookingAccessTokenService.generateToken();

            order.setCancellationTokenHash(generated.hash());
            order.setCancellationTokenExpiresAt(calculateTokenExpiry(order));

            // pass raw token to email
            emailService.sendOrderConfirmation(order, generated.rawToken());

        } else {
            emailService.sendOrderConfirmation(order, null);
        }

        log.info("Payment succeeded: orderId={}, paymentId={}", order.getId(), paymentId);

        paymentRepository.save(payment);

        return Result.ok();
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getById(Long id, Authentication auth) {

        Payment payment = paymentRepository.findById(id).orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        try {
            assertCanAccessPayment(payment, auth);
        } catch (AccessDeniedException ex) {
            return Result.fail(ApiError.forbidden(ex.getMessage()));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getByOrderId(Long orderId, Authentication auth) {

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        try {
            assertCanAccessPayment(payment, auth);
        } catch (AccessDeniedException ex) {
            return Result.fail(ApiError.forbidden(ex.getMessage()));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    public Result<PaymentResponseDto> getPublicByOrderId(Long orderId, String token) {

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        if (payment == null) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        if (!hasValidReservationToken(payment.getOrder(), token)) {
            return Result.fail(ApiError.notFound("Payment not found"));
        }

        return Result.ok(paymentMapper.toDto(payment));
    }

    @Transactional(readOnly = true)
    @ShopAccess(value = AccessLevel.MANAGER, source = ShopIdSource.SHOP_ID)
    public Result<List<PaymentLineResponseDto>> getShopPaymentLines(Long shopId) {

        List<PaymentLine> lines = paymentLineRepository.findSuccessfulByShopId(shopId, PaymentStatus.SUCCEEDED);

        return Result.ok(paymentLineMapper.toDtoList(lines));
    }

    private Instant calculateTokenExpiry(Order order) {

        ZoneId zone = ZoneId.of("Europe/Berlin"); // use your business timezone

        Instant latestStart = order.getOrderItems().stream()
                .map(item -> {
                    TourSchedule schedule = item.getSchedule();

                    LocalDate date = schedule.getDate();
                    LocalTime time = schedule.getTime() != null
                            ? schedule.getTime()
                            : LocalTime.MIDNIGHT;

                    return ZonedDateTime.of(date, time, zone).toInstant();
                })
                .max(Comparator.naturalOrder())
                .orElseThrow();

        return latestStart.plus(30, ChronoUnit.DAYS);
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }

        return query.trim();
    }

    private void assertCanAccessPayment(Payment payment, Authentication auth) {
        if (payment.getOrder() == null) {
            throw new AccessDeniedException("Not allowed to view this payment");
        }

        if (auth != null
                && auth.isAuthenticated()
                && auth.getPrincipal() instanceof CustomUserDetails user) {

            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (isAdmin) {
                return;
            }

            if (payment.getOrder().getUser() != null
                    && payment.getOrder().getUser().getId().equals(user.getId())) {
                return;
            }
        }

        throw new AccessDeniedException("Not allowed to view this payment");
    }

    private boolean hasValidReservationToken(Order order, String token) {
        return order != null
                && token != null
                && order.getReservationToken() != null
                && token.equals(order.getReservationToken().toString());
    }

    private PaymentStatus normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return PaymentStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private Specification<PaymentLine> buildAdminPaymentLineSpecification(
            String query,
            PaymentStatus status,
            Instant createdFrom,
            Instant createdTo) {

        return (root, criteriaQuery, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (createdFrom != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
            }

            if (createdTo != null) {
                predicates.add(criteriaBuilder.lessThan(root.get("createdAt"), createdTo));
            }

            if (query != null) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.function(
                                "to_char",
                                String.class,
                                root.get("shopId"),
                                criteriaBuilder.literal("FM999999999999999999")),
                        "%" + query + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
