package com.example.store_manager.mapper;

import java.time.ZoneOffset;

import org.springframework.stereotype.Component;

import com.example.store_manager.dto.cart.CheckoutDetailsDto;
import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderResponseDto;
import com.example.store_manager.dto.tour.TourSnapshotDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderStatus;
import com.example.store_manager.model.Tour;
import com.example.store_manager.model.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ObjectMapper objectMapper;

    // Create Order entity from DTO
    public Order toEntity(OrderCreateRequestDto dto, User user, Tour tour) {

        TourSnapshotDto snapshot = TourSnapshotDto.builder()
                .id(tour.getId())
                .title(tour.getTitle())
                .description(tour.getDescription())
                .price(tour.getPrice())
                .build();

        String tourSnapshot = toJson(snapshot);

        return Order.builder()
                .user(user)
                .tour(tour)
                .tourSnapshot(tourSnapshot)
                .name(dto.getCheckoutDetails().getName())
                .email(dto.getCheckoutDetails().getEmail())
                .phone(dto.getCheckoutDetails().getPhone())
                .nationality(dto.getCheckoutDetails().getNationality())
                .participants(dto.getParticipants())
                .scheduledAt(dto.getScheduledAt())
                .status(OrderStatus.PENDING)
                .paymentMethod(dto.getPaymentMethod())
                .pricePaid(tour.getPrice()) // could be dynamic if needed
                .build();
    }

    // Convert Order entity to safe DTO
    public OrderResponseDto toDto(Order order) {
        Tour tourSnapshot = fromJson(order.getTourSnapshot(), Tour.class);

        return OrderResponseDto.builder()
                .id(order.getId())
                .tourId(order.getTour().getId())
                .participants(order.getParticipants())
                .scheduledAt(order.getScheduledAt().toInstant(ZoneOffset.UTC))
                .checkoutDetails(
                        CheckoutDetailsDto.builder()
                                .name(order.getName())
                                .email(order.getEmail())
                                .phone(order.getPhone())
                                .nationality(order.getNationality())
                                .build())
                .paymentMethod(order.getPaymentMethod())
                .pricePaid(order.getPricePaid())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

    // Utility methods
    public String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON serialization failed", e);
        }
    }

    public <T> T fromJson(String json, Class<T> cls) {
        try {
            return objectMapper.readValue(json, cls);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("JSON deserialization failed", e);
        }
    }
}