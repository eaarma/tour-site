package com.example.store_manager.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourSchedule;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourScheduleRepository;
import com.example.store_manager.utility.ApiError;
import com.example.store_manager.utility.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

        private final OrderService orderService;
        private final OrderRepository orderRepo;
        private final TourScheduleRepository scheduleRepo;

        @Transactional
        public Result<Order> reserve(OrderCreateRequestDto dto, User user) {

                Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

                UUID token = UUID.randomUUID();

                Order order = Order.builder()
                                .user(user)
                                .status(OrderStatus.RESERVED)
                                .expiresAt(expiresAt)
                                .reservationToken(token)
                                .totalPrice(BigDecimal.ZERO)
                                .build();

                BigDecimal total = BigDecimal.ZERO;

                for (OrderItemCreateRequestDto itemDto : dto.getItems()) {

                        TourSchedule schedule = scheduleRepo
                                        .findByIdForUpdate(itemDto.getScheduleId())
                                        .orElse(null);

                        if (schedule == null) {
                                return Result.fail(ApiError.notFound("Schedule not found"));
                        }

                        if (schedule.getAvailableParticipants() < itemDto.getParticipants()) {
                                return Result.fail(ApiError.badRequest("Not enough availability"));
                        }

                        schedule.setReservedParticipants(
                                        schedule.getReservedParticipants() + itemDto.getParticipants());

                        Tour tour = schedule.getTour();

                        BigDecimal price = tour.getPrice()
                                        .multiply(BigDecimal.valueOf(itemDto.getParticipants()));

                        total = total.add(price);

                        OrderItem orderItem = OrderItem.builder()
                                        .order(order)
                                        .tour(tour)
                                        .schedule(schedule)
                                        .shopId(tour.getShop().getId())
                                        .tourTitle(tour.getTitle())
                                        .scheduledAt(LocalDateTime.of(schedule.getDate(), schedule.getTime()))
                                        .participants(itemDto.getParticipants())
                                        .name(dto.getName())
                                        .email(dto.getEmail())
                                        .phone(dto.getPhone())
                                        .nationality(dto.getNationality())
                                        .paymentMethod(dto.getPaymentMethod())
                                        .status(OrderStatus.RESERVED)
                                        .pricePaid(price)
                                        .tourSnapshot("")
                                        .build();

                        order.getOrderItems().add(orderItem);
                }

                order.setTotalPrice(total);

                return Result.ok(orderRepo.save(order));
        }

}
