package com.example.store_manager.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import org.springframework.validation.annotation.Validated;

@Component
@Data
@Validated
@ConfigurationProperties(prefix = "stripe")
public class StripeProperties {

    @NotBlank
    private String apiKey;

    @NotBlank
    private String webhookSecret;

    private String accountId;

    private boolean enabled = true;

    private String apiVersion;
}
