package com.example.store_manager.infrastructure.stripe;

import org.springframework.stereotype.Component;

import com.example.store_manager.config.properties.StripeProperties;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;

import lombok.RequiredArgsConstructor;


@Component
@RequiredArgsConstructor
public class StripeWebhookVerifier {

    private final StripeProperties stripeProperties;

    public Event verify(String payload, String signature) {
        try {
            return Webhook.constructEvent(
                    payload,
                    signature,
                    stripeProperties.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            throw new IllegalArgumentException("Invalid Stripe signature", e);
        }
    }
}
