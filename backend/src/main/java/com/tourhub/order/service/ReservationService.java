package com.tourhub.order.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tourhub.order.dto.OrderCreateRequestDto;
import com.tourhub.order.dto.OrderItemCreateRequestDto;
import com.tourhub.order.model.Order;
import com.tourhub.order.model.OrderItem;
import com.tourhub.order.model.OrderStatus;
import com.tourhub.tour.model.Tour;
import com.tourhub.tour.model.TourSchedule;
import com.tourhub.order.repository.OrderRepository;
import com.tourhub.tour.repository.TourScheduleRepository;
import com.tourhub.user.model.User;
import com.tourhub.common.result.ApiError;
import com.tourhub.common.result.Result;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

        private final OrderService orderService;
        private final OrderRepository orderRepo;

        @Transactional
        public Result<Order> reserve(OrderCreateRequestDto dto, User user) {

                Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);
                UUID token = UUID.randomUUID();

                // Reuse the central builder.
                Result<Order> built = orderService.buildOrder(
                                dto,
                                user,
                                OrderStatus.RESERVED,
                                true // reserve only
                );

                if (built.isFail()) {
                        return built;
                }

                Order order = built.get();

                order.setExpiresAt(expiresAt);
                order.setReservationToken(token);

                return Result.ok(orderRepo.save(order));
        }
}

