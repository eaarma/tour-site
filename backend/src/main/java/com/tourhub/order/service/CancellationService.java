package com.tourhub.order.service;

import com.tourhub.common.result.Result;
import com.tourhub.order.event.OrderItemCancelledEvent;
import com.tourhub.order.model.CancelledBy;
import com.tourhub.order.model.CancellationReasonType;
import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.order.repository.OrderItemRepository;
import com.tourhub.payment.model.Payment;
import com.tourhub.payment.model.PaymentLine;
import com.tourhub.payment.model.PaymentLineType;
import com.tourhub.payment.model.PaymentStatus;
import com.tourhub.payment.repository.PaymentLineRepository;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.tour.repository.TourScheduleRepository;
import com.stripe.model.Refund;
import com.stripe.net.RequestOptions;
import com.stripe.param.RefundCreateParams;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;
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
        private final ApplicationEventPublisher eventPublisher;

        /**
         * Core cancellation entry point.
         * This method is agnostic of how authorization was performed.
         * It only operates on domain state.
         */
        @Transactional
        public Result<CancellationResult> cancelOrderItem(
                        OrderItem item,
                        CancelledBy actor,
                        CancellationReasonType reasonType,
                        String reason) {

                // Guard against repeated cancellation requests.
                if (item.getStatus() == OrderStatus.CANCELLED ||
                                item.getStatus() == OrderStatus.CANCELLED_CONFIRMED) {

                        log.info("OrderItem {} already cancelled", item.getId());

                        return Result.ok(new CancellationResult(
                                        item.getId(),
                                        actor,
                                        item.getStatus() == OrderStatus.CANCELLED_CONFIRMED,
                                        BigDecimal.ZERO,
                                        item.getStatus()));
                }

                // Check whether the order item is refundable.
                boolean refundable = isRefundable(item);
                BigDecimal refundAmount = refundable
                                ? item.getPricePaid()
                                : BigDecimal.ZERO;

                // Process the Stripe refund when the item is refundable.
                if (refundable) {
                        PaymentLine saleLine = paymentLineRepository
                                        .findSaleLineForUpdate(item.getId())
                                        .orElseThrow(() -> new IllegalStateException(
                                                        "Payment line not found for order item " + item.getId()));

                        processStripeRefund(item, saleLine, refundAmount);
                }

                // 4️⃣ Reverse inventory
                releaseInventory(item);

                // 5️⃣ Update domain state
                item.setStatus(refundable
                                ? OrderStatus.CANCELLED_CONFIRMED
                                : OrderStatus.CANCELLED);

                item.setCancelledAt(Instant.now());
                item.setCancellationReason(reason);
                item.setCancelledBy(actor);
                item.setCancellationReasonType(reasonType);

                updateOrderStatusIfNecessary(item.getOrder());

                log.info("OrderItem {} cancelled. Refundable={}", item.getId(), refundable);

                eventPublisher.publishEvent(new OrderItemCancelledEvent(
                                item.getId(),
                                actor,
                                refundable,
                                refundAmount));

                return Result.ok(new CancellationResult(
                                item.getId(),
                                actor,
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
        private void processStripeRefund(OrderItem item, PaymentLine saleLine, BigDecimal amount) {

                if (saleLine == null) {
                        throw new IllegalStateException("PaymentLine not found for order item " + item.getId());
                }

                boolean refundExists = paymentLineRepository
                                .existsByOrderItemIdAndType(item.getId(), PaymentLineType.REFUND);

                if (refundExists) {
                        log.info("Refund PaymentLine already exists for order item {}", item.getId());
                        return;
                }
                if (saleLine.getStatus() != PaymentStatus.SUCCEEDED) {
                        log.warn("Skipping Stripe refund because payment line is not SUCCEEDED for item {}",
                                        item.getId());
                        return;
                }

                Payment payment = saleLine.getPayment();

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

                // paymentLine.setStatus(PaymentStatus.REFUNDED);
                PaymentLine refundLine = PaymentLine.builder()
                                .payment(saleLine.getPayment())
                                .orderItem(item)
                                .shopId(saleLine.getShopId())
                                .type(PaymentLineType.REFUND)
                                .grossAmount(amount.negate())
                                .platformFee(saleLine.getPlatformFee().negate())
                                .shopAmount(saleLine.getShopAmount().negate())
                                .currency(saleLine.getCurrency())
                                .status(PaymentStatus.SUCCEEDED)
                                .build();

                paymentLineRepository.save(refundLine);
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
                        Long orderItemId,
                        CancelledBy actor,
                        boolean refundable,
                        BigDecimal refundAmount,
                        OrderStatus newStatus) {
        }

}

