package com.example.store_manager.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.tour.TourSnapshotDto;
import com.example.store_manager.mapper.OrderItemMapper;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

        private final OrderRepository orderRepository;
        private final UserRepository userRepository;
        private final TourRepository tourRepository;
        private final OrderMapper orderMapper;
        private final OrderItemMapper orderItemMapper;

        /**
         * Create a new order with multiple items.
         */
        public OrderResponseDto createOrder(OrderCreateRequestDto dto, UUID userId) {
                User user = null;
                if (userId != null) {
                        user = userRepository.findById(userId)
                                        .orElseThrow(() -> new RuntimeException("User not found"));
                }

                // 1️⃣ Create master Order
                Order order = Order.builder()
                                .user(user)
                                .paymentMethod(dto.getPaymentMethod())
                                .status(OrderStatus.PENDING)
                                .build();

                // 2️⃣ Build OrderItems from DTOs
                for (OrderItemCreateRequestDto itemDto : dto.getItems()) {
                        Tour tour = tourRepository.findById(itemDto.getTourId())
                                        .orElseThrow(() -> new RuntimeException("Tour not found"));

                        TourSnapshotDto snapshot = TourSnapshotDto.builder()
                                        .id(tour.getId())
                                        .title(tour.getTitle())
                                        .description(tour.getDescription())
                                        .price(tour.getPrice())
                                        .build();

                        OrderItem item = OrderItem.builder()
                                        .order(order)
                                        .tour(tour)
                                        .shopId(tour.getShop().getId())
                                        .tourTitle(tour.getTitle())
                                        .scheduledAt(itemDto.getScheduledAt())
                                        .participants(itemDto.getParticipants())
                                        .name(dto.getName())
                                        .email(dto.getEmail())
                                        .phone(dto.getPhone())
                                        .nationality(dto.getNationality())
                                        .paymentMethod(dto.getPaymentMethod())
                                        .status(OrderStatus.PENDING)
                                        .pricePaid(tour.getPrice()
                                                        .multiply(BigDecimal.valueOf(itemDto.getParticipants())))
                                        .tourSnapshot(orderMapper.toJsonSnapshot(snapshot))
                                        .build();

                        order.getOrderItems().add(item);
                }

                // 3️⃣ Calculate total price
                BigDecimal totalPrice = order.getOrderItems().stream()
                                .map(OrderItem::getPricePaid)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                order.setTotalPrice(totalPrice);

                // 4️⃣ Save order
                Order saved = orderRepository.save(order);

                // 5️⃣ Return DTO
                return orderMapper.toDto(saved);
        }

        /**
         * Get a single order by ID.
         */
        @Transactional(readOnly = true)
        public OrderResponseDto getOrderById(Long orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new RuntimeException("Order not found"));
                return orderMapper.toDto(order);
        }

        /**
         * List all orders for a specific user.
         */
        @Transactional(readOnly = true)
        public List<OrderResponseDto> getOrdersByUser(UUID userId) {
                return orderRepository.findByUserId(userId)
                                .stream()
                                .map(orderMapper::toDto)
                                .collect(Collectors.toList());
        }

        /**
         * List all OrderItems for a given shop (provider) across all orders.
         */

        @Transactional(readOnly = true)
        public List<OrderItemResponseDto> getOrderItemsByShop(Long shopId) {
                return orderRepository.findAll().stream()
                                .flatMap(order -> order.getOrderItems().stream())
                                .filter(item -> item.getTour() != null
                                                && item.getTour().getShop().getId().equals(shopId))
                                .map(orderItemMapper::toDto)
                                .collect(Collectors.toList());
        }
}