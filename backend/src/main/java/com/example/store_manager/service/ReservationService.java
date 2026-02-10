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

        @Transactional
        public Result<Order> reserve(OrderCreateRequestDto dto, User user) {

                Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);
                UUID token = UUID.randomUUID();

                // ✅ reuse central builder
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
