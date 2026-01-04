package com.example.store_manager.security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@ConfigurationProperties(prefix = "security.refresh")
@Getter
@Setter
public class RefreshSecurityProperties {

    private List<String> allowedOrigins = new ArrayList<>();
}
