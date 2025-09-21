package com.example.store_manager.mapper;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.model.Order;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final OrderItemMapper orderItemMapper;
    private final ObjectMapper objectMapper; // ✅ inject directly

    public Order toEntity(OrderCreateRequestDto dto, User user) {
        return Order.builder()
                .user(user)
                .paymentMethod(dto.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .build(); // items are populated later in service
    }

    public OrderResponseDto toDto(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .totalPrice(order.getTotalPrice())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(order.getOrderItems().stream()
                        .map(orderItemMapper::toDto)
                        .collect(Collectors.toList()))
                .build();
    }

    // ✅ fixed: use injected ObjectMapper
    public String toJsonSnapshot(Object tourSnapshot) {
        try {
            return objectMapper.writeValueAsString(tourSnapshot);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize tour snapshot", e);
        }
    }
}