package com.example.store_manager.jobs;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.store_manager.service.PaymentExpirationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentExpirationJob {

    private final PaymentExpirationService expirationService;

    @Scheduled(fixedDelay = 60000) // every 60 seconds
    public void run() {
        expirationService.expirePendingPayments();
    }
}
