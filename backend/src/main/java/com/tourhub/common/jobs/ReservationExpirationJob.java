package com.tourhub.common.jobs;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.order.repository.OrderRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationExpirationJob {

    private final OrderRepository orderRepo;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireReservations() {

        List<Order> expired = orderRepo
                .findExpiredReservations(Instant.now());

        for (Order order : expired) {

            for (OrderItem item : order.getOrderItems()) {

                TourSchedule schedule = item.getSchedule();

                schedule.releaseReserved(item.getParticipants());

                item.setStatus(OrderStatus.EXPIRED);
            }

            order.setStatus(OrderStatus.EXPIRED);
        }
    }
}
