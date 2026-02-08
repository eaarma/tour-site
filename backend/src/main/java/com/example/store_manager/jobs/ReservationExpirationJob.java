package com.example.store_manager.jobs;

import java.time.Instant;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationExpirationJob {

    private final OrderRepository orderRepo;
    private final TourScheduleRepository scheduleRepo;

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireReservations() {

        List<Order> expired = orderRepo
                .findExpiredReservations(Instant.now());

        for (Order order : expired) {

            for (OrderItem item : order.getOrderItems()) {

                TourSchedule schedule = item.getSchedule();

                schedule.setReservedParticipants(
                        schedule.getReservedParticipants() - item.getParticipants());
            }

            order.setStatus(OrderStatus.EXPIRED);
        }
    }
}
