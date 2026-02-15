package com.example.store_manager.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.PaymentRepository;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.utility.Result;
import com.example.store_manager.utility.ApiError;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class StripeService {

        private static final Logger log = LoggerFactory.getLogger(StripeService.class);

        private final OrderRepository orderRepository;
        private final PaymentRepository paymentRepository;

        @Transactional
        public Result<String> createPaymentIntent(Long orderId) {

                Order order = orderRepository.findById(orderId)
                                .orElse(null);

                if (order == null) {
                        return Result.fail(
                                        ApiError.notFound("Order not found"));
                }

                Payment payment = paymentRepository
                                .findByOrderId(orderId)
                                .orElse(null);

                if (payment == null) {
                        return Result.fail(
                                        ApiError.badRequest(
                                                        "Payment record missing for order"));
                }

                try {

                        if (order.getStatus() != OrderStatus.FINALIZED) {
                                return Result.fail(
                                                ApiError.badRequest(
                                                                "Order is not finalized for payment"));
                        }

                        // Stripe expects amount in cents
                        long amountCents = payment.getAmountTotal()
                                        .multiply(BigDecimal.valueOf(100))
                                        .setScale(0, RoundingMode.HALF_UP)
                                        .longValue();

                        if (payment.getProviderPaymentId() != null) {
                                try {
                                        PaymentIntent existing = PaymentIntent.retrieve(payment.getProviderPaymentId());

                                        return Result.ok(existing.getClientSecret());

                                } catch (Exception e) {
                                        log.warn("Failed to retrieve existing intent, creating new", e);
                                }
                        }

                        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                                        .setAmount(amountCents)
                                        .setCurrency(payment.getCurrency().toLowerCase())
                                        .putMetadata("orderId",
                                                        orderId.toString())
                                        .putMetadata("paymentId",
                                                        payment.getId().toString())

                                        .build();

                        RequestOptions options = RequestOptions.builder()
                                        .setIdempotencyKey("order-" + orderId)
                                        .build();

                        PaymentIntent intent = PaymentIntent.create(params, options);

                        payment.setProviderPaymentId(intent.getId());
                        payment.setStatus(PaymentStatus.PENDING);

                        paymentRepository.save(payment);

                        log.info("Created Stripe PaymentIntent {} for order {}",
                                        intent.getId(), orderId);

                        return Result.ok(intent.getClientSecret());

                } catch (Exception e) {

                        log.error("Stripe error creating payment intent", e);

                        return Result.fail(
                                        ApiError.internal(
                                                        "Stripe payment creation failed"));
                }
        }
}
