package com.tourhub.payment.service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.payment.model.Payment;
import com.tourhub.payment.model.PaymentStatus;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentExpirationService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public void expirePendingPayments() {

        Instant cutoff = Instant.now().minus(Duration.ofMinutes(15));

        List<Payment> expiredPayments = paymentRepository.findExpiredPendingPayments(cutoff);

        for (Payment payment : expiredPayments) {

            if (payment.getStatus() != PaymentStatus.PENDING) {
                continue;
            }

            log.info("Expiring payment {}", payment.getId());

            payment.setStatus(PaymentStatus.FAILED);
            payment.getPaymentLines()
                    .forEach(line -> line.setStatus(PaymentStatus.FAILED));

            Order order = payment.getOrder();

            if (order.getStatus() != OrderStatus.PAID) {

                for (OrderItem item : order.getOrderItems()) {

                    TourSchedule schedule = item.getSchedule();

                    // release reserved participants
                    schedule.releaseReserved(item.getParticipants());

                    item.setStatus(OrderStatus.FAILED);
                }

                order.setStatus(OrderStatus.FAILED);
            }
        }

    }
}
