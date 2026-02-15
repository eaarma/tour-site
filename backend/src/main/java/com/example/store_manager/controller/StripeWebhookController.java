package com.example.store_manager.controller;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.store_manager.config.properties.StripeProperties;
import com.example.store_manager.infrastructure.stripe.StripeWebhookVerifier;
import com.example.store_manager.model.StripeEvent;
import com.example.store_manager.repository.StripeEventRepository;
import com.example.store_manager.service.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/stripe/webhook")
@RequiredArgsConstructor
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final PaymentService paymentService;
    private final StripeWebhookVerifier webhookVerifier;
    private final StripeEventRepository stripeEventRepository;

    @PostMapping
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        Event event;

        try {
            event = webhookVerifier.verify(payload, signature);

            String eventId = event.getId();

            if (stripeEventRepository.existsByStripeEventId(eventId)) {
                log.info("Duplicate Stripe event ignored: {}", eventId);
                return ResponseEntity.ok().build();
            }

        } catch (Exception e) {
            log.error("Invalid Stripe webhook signature", e);
            return ResponseEntity.badRequest().build();
        }

        log.info("Stripe webhook received: {}", event.getType());

        switch (event.getType()) {

            case "payment_intent.succeeded" -> handleSuccess(event);

            case "payment_intent.payment_failed" -> handleFailure(event);

            default -> log.info("Unhandled Stripe event: {}", event.getType());
        }

        return ResponseEntity.ok().build();
    }

    private void handleSuccess(Event event) {

        PaymentIntent intent;

        try {
            intent = PaymentIntent.GSON.fromJson(
                    event.getData().getObject().toJson(),
                    PaymentIntent.class);
        } catch (Exception e) {
            log.error("Stripe deserialization failed", e);
            return;
        }

        String paymentIdStr = intent.getMetadata().get("paymentId");

        if (paymentIdStr == null) {
            log.error("PaymentIntent missing paymentId metadata: {}", intent.getId());
            return;
        }

        Long paymentId = Long.valueOf(paymentIdStr);

        try {

            paymentService.markPaymentSucceeded(paymentId);

            StripeEvent stripeEvent = new StripeEvent();
            stripeEvent.setStripeEventId(event.getId());
            stripeEvent.setEventType(event.getType());
            stripeEvent.setPaymentId(paymentId);
            stripeEvent.setProcessedAt(Instant.now());

            stripeEventRepository.save(stripeEvent);

            log.info("Stripe event stored and payment marked succeeded: eventId={}, paymentId={}",
                    event.getId(), paymentId);

        } catch (Exception e) {
            log.error("Failed to mark payment succeeded", e);
        }
    }

    private void handleFailure(Event event) {

        PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                .getObject()
                .orElse(null);

        if (intent == null)
            return;

        log.warn("Payment failed: {}", intent.getId());

        // optional: mark failed in DB
    }
}
