package com.example.store_manager.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.mapper.OrderMapper;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.User;
import com.example.store_manager.repository.OrderRepository;
import com.example.store_manager.repository.TourRepository;
import com.example.store_manager.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final ObjectMapper objectMapper;
    private final OrderRepository orderRepository;
    private final TourRepository tourRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public OrderResponseDto createOrder(OrderCreateRequestDto dto, UUID userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        Order order = orderMapper.toEntity(dto, user, tour);
        Order saved = orderRepository.save(order);
        return orderMapper.toDto(saved);
    }

    public OrderResponseDto getOrderById(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return orderMapper.toDto(order);
    }

    public OrderResponseDto updateOrder(UUID id, OrderCreateRequestDto dto) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        Tour tour = tourRepository.findById(dto.getTourId())
                .orElseThrow(() -> new RuntimeException("Tour not found"));

        // update mutable fields
        order.setTour(tour);
        order.setScheduledAt(dto.getScheduledAt());
        order.setParticipants(dto.getParticipants());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setPricePaid(tour.getPrice());
        order.setTourSnapshot(orderMapper.toJson(tour));
        order.setName(dto.getCheckoutDetails().getName());
        order.setEmail(dto.getCheckoutDetails().getEmail());
        order.setPhone(dto.getCheckoutDetails().getPhone());
        order.setNationality(dto.getCheckoutDetails().getNationality());
        return orderMapper.toDto(orderRepository.save(order));
    }

    public List<OrderResponseDto> getOrdersByShopId(Long shopId) {
        return orderRepository.findByTourShopId(shopId)
                .stream()
                .map(orderMapper::toDto)
                .toList();
    }
}