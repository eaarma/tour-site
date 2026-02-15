package com.example.store_manager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

import com.stripe.Stripe;
import com.example.store_manager.config.properties.StripeProperties;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;

@Configuration
@RequiredArgsConstructor
public class StripeConfig {

    private static final Logger logger = LoggerFactory.getLogger(StripeConfig.class);

    private final StripeProperties stripeProperties;

    @PostConstruct
    public void init() {

        if (!stripeProperties.isEnabled()) {
            logger.warn("Stripe integration is disabled");
            return;
        }

        String apiKey = stripeProperties.getApiKey();

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "Stripe API key is not configured");
        }

        Stripe.apiKey = apiKey;

        logger.info("Stripe API initialized successfully");
    }

    public StripeProperties getProperties() {
        return stripeProperties;
    }
}
