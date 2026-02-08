package com.example.store_manager.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.reserve.ReserveItemDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final TourScheduleRepository scheduleRepo;
    private final OrderRepository orderRepo;

    @Transactional
    public Order reserve(List<ReserveItemDto> items, User user) {

        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.RESERVED)
                .expiresAt(expiresAt)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (ReserveItemDto item : items) {

            TourSchedule schedule = scheduleRepo
                    .findByIdForUpdate(item.getScheduleId())
                    .orElseThrow(() -> new RuntimeException("Schedule not found"));

            if (schedule.getAvailableParticipants() < item.getParticipants()) {
                throw new IllegalStateException("Not enough availability");
            }

            schedule.setReservedParticipants(
                    schedule.getReservedParticipants() + item.getParticipants());

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .schedule(schedule)
                    .scheduledAt(LocalDateTime.of(schedule.getDate(), schedule.getTime()))
                    .participants(item.getParticipants())
                    .status(OrderStatus.RESERVED)
                    .build();

            order.getOrderItems().add(orderItem);
        }

        return orderRepo.save(order);
    }
}
