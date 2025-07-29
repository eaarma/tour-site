package com.example.store_manager.mapper;

import java.time.ZoneOffset;

import org.springframework.stereotype.Component;

import com.example.store_manager.dto.cart.CheckoutDetailsDto;
import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderResponseDto;
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
    
    public Order toEntity(OrderCreateRequestDto dto, User user, Tour tour) {
       String tourSnapshot = toJson(tour);
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
                .pricePaid(tour.getPrice())
                .build();
    }

    public OrderResponseDto toDto(Order order) {
   
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
        .build()
)        
        .paymentMethod(order.getPaymentMethod())
                .pricePaid(order.getPricePaid())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .build();
    }

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

    public Tour fromTourSnapshot(Order order) {
    return fromJson(order.getTourSnapshot(), Tour.class);
}
 
}