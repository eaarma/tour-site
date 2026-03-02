package com.example.store_manager.service;

import com.example.store_manager.model.*;
import com.example.store_manager.repository.*;
import com.example.store_manager.utility.Result;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CancellationService {

        private final OrderItemRepository orderItemRepository;
        private final TourScheduleRepository tourScheduleRepository;
        private final PaymentLineRepository paymentLineRepository;
        private final EmailService emailService;

        /**
         * Core cancellation entry point.
         * This method is agnostic of how authorization was performed.
         * It only operates on domain state.
         */

        @Transactional
        public Result<CancellationResult> cancelOrderItem(
                        Long orderItemId,
                        CancelledBy actor,
                        CancellationReasonType reasonType,
                        String reason) {

                OrderItem item = orderItemRepository.findById(orderItemId)
                                .orElseThrow(() -> new IllegalStateException("OrderItem not found"));

                // ----------------------------
                // 1️⃣ Idempotency guard
                // ----------------------------
                if (item.getStatus() == OrderStatus.CANCELLED ||
                                item.getStatus() == OrderStatus.CANCELLED_CONFIRMED) {

                        log.info("OrderItem {} already cancelled", orderItemId);

                        return Result.ok(new CancellationResult(
                                        item.getStatus() == OrderStatus.CANCELLED_CONFIRMED,
                                        BigDecimal.ZERO,
                                        item.getStatus()));
                }

                // ----------------------------
                // 2️⃣ Refund eligibility
                // ----------------------------
                boolean refundable = isRefundable(item);
                // boolean refundable = false; // For testing, disable refunds for now
                BigDecimal refundAmount = refundable
                                ? item.getPricePaid()
                                : BigDecimal.ZERO;

                // ----------------------------
                // 3️⃣ Stripe refund (if refundable)
                // ----------------------------
                if (refundable) {
                        processStripeRefund(item, refundAmount);
                }

                // ----------------------------
                // 4️⃣ Reverse inventory
                // ----------------------------
                releaseInventory(item);

                // ----------------------------
                // 5️⃣ Update domain state
                // ----------------------------
                item.setStatus(refundable
                                ? OrderStatus.CANCELLED_CONFIRMED
                                : OrderStatus.CANCELLED);

                item.setCancelledAt(Instant.now());
                item.setCancellationReason(reason);
                item.setCancelledBy(actor);
                item.setCancellationReasonType(reasonType);

                emailService.sendCancellationConfirmation(
                                item,
                                refundable,
                                refundAmount);

                updateOrderStatusIfNecessary(item.getOrder());

                log.info("OrderItem {} cancelled. Refundable={}", orderItemId, refundable);

                return Result.ok(new CancellationResult(
                                refundable,
                                refundAmount,
                                item.getStatus()));
        }

        /**
         * Determines whether cancellation qualifies for refund.
         * Business rule: >24h before scheduled start.
         */
        private boolean isRefundable(OrderItem item) {

                Instant now = Instant.now();

                Instant tourStart = item.getScheduledAt()
                                .atZone(ZoneOffset.UTC) // explicit
                                .toInstant();

                return now.isBefore(tourStart.minus(24, ChronoUnit.HOURS));
        }

        /**
         * Calls Stripe to create refund.
         * Uses idempotency key to prevent duplicate refunds.
         */
        private void processStripeRefund(OrderItem item, BigDecimal amount) {

                PaymentLine paymentLine = paymentLineRepository
                                .findByOrderItemIdForUpdate(item.getId())
                                .orElseThrow(() -> new IllegalStateException(
                                                "PaymentLine not found for order item " + item.getId()));

                if (paymentLine.getStatus() == PaymentStatus.REFUNDED) {
                        log.info("PaymentLine {} already refunded", paymentLine.getId());
                        return; // idempotency guard
                }

                Payment payment = paymentLine.getPayment();

                if (payment.getProviderPaymentId() == null) {
                        throw new IllegalStateException("Stripe payment id missing");
                }

                long cents = amount
                                .multiply(BigDecimal.valueOf(100))
                                .longValueExact();

                RefundCreateParams params = RefundCreateParams.builder()
                                .setPaymentIntent(payment.getProviderPaymentId())
                                .setAmount(cents)
                                .build();

                RequestOptions options = RequestOptions.builder()
                                .setIdempotencyKey("refund-" + item.getId())
                                .build();

                try {
                        Refund.create(params, options);
                } catch (Exception e) {
                        log.error("Stripe refund failed for item {}", item.getId(), e);
                        throw new IllegalStateException("Refund failed");
                }

                paymentLine.setStatus(PaymentStatus.REFUNDED);
        }

        /**
         * Releases previously booked participants.
         * Uses SELECT FOR UPDATE via repository method.
         */
        private void releaseInventory(OrderItem item) {

                TourSchedule schedule = tourScheduleRepository
                                .findByIdForUpdate(item.getSchedule().getId())
                                .orElseThrow(() -> new IllegalStateException("Schedule not found"));

                int qty = item.getParticipants();

                int currentBooked = schedule.getBookedParticipants() == null
                                ? 0
                                : schedule.getBookedParticipants();

                schedule.setBookedParticipants(Math.max(0, currentBooked - qty));

                // If it was marked BOOKED, reopen if capacity exists
                if ("BOOKED".equals(schedule.getStatus())) {
                        schedule.setStatus("ACTIVE");
                }
        }

        /**
         * If all order items are cancelled,
         * update order status accordingly.
         */
        private void updateOrderStatusIfNecessary(Order order) {

                boolean allCancelled = order.getOrderItems().stream()
                                .allMatch(item -> item.getStatus() == OrderStatus.CANCELLED ||
                                                item.getStatus() == OrderStatus.CANCELLED_CONFIRMED);

                if (allCancelled) {
                        order.setStatus(OrderStatus.CANCELLED);
                }
        }

        // ---------------------------------------
        // Result wrapper returned to controller
        // ---------------------------------------

        public record CancellationResult(
                        boolean refundable,
                        BigDecimal refundAmount,
                        OrderStatus newStatus) {
        }

}