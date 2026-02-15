package com.example.store_manager.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Payment;
import com.example.store_manager.model.PaymentStatus;
import com.example.store_manager.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentExpirationService {

    private final PaymentRepository paymentRepository;
    private final Logger log = LoggerFactory.getLogger(PaymentExpirationService.class);

    @Transactional
    public void expirePendingPayments() {

        Instant cutoff = Instant.now().minus(Duration.ofMinutes(15));

        List<Payment> expiredPayments = paymentRepository.findExpiredPendingPayments(cutoff);

        for (Payment payment : expiredPayments) {

            // Double safety check
            if (payment.getStatus() != PaymentStatus.PENDING) {
                continue;
            }

            log.info("Expiring payment {}", payment.getId());

            payment.setStatus(PaymentStatus.FAILED);

            payment.getPaymentLines()
                    .forEach(line -> line.setStatus(PaymentStatus.FAILED));

            Order order = payment.getOrder();

            if (order.getStatus() != OrderStatus.PAID) {
                order.setStatus(OrderStatus.FAILED);
                order.getOrderItems()
                        .forEach(item -> item.setStatus(OrderStatus.FAILED));
            }
        }
    }
}
