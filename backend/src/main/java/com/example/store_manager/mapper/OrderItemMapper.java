package com.example.store_manager.mapper;

import java.math.BigDecimal;
import java.util.Optional;

import com.example.store_manager.dto.order.OrderCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemCreateRequestDto;
import com.example.store_manager.dto.order.OrderItemResponseDto;
import com.example.store_manager.model.Order;
import com.example.store_manager.model.OrderItem;
import com.example.store_manager.model.OrderStatus;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Component;

import com.example.store_manager.model.Tour;
import com.example.store_manager.model.TourImage;
import com.example.store_manager.model.TourSession;

@Component
@RequiredArgsConstructor
public class OrderItemMapper {

    private final ObjectMapper objectMapper;

    // Map DTO -> entity (Tour will be set in service)
    public OrderItem toEntity(OrderItemCreateRequestDto dto, Order parentOrder, Tour tour,
            OrderCreateRequestDto parentDto) {
        return OrderItem.builder()
                .order(parentOrder)
                .tour(tour)
                .shopId(tour.getShop().getId())
                .tourTitle(tour.getTitle())
                .scheduledAt(dto.getScheduledAt())
                .participants(dto.getParticipants())
                .name(parentDto.getName())
                .email(parentDto.getEmail())
                .phone(parentDto.getPhone())
                .nationality(parentDto.getNationality())
                .preferredLanguage(dto.getPreferredLanguage())
                .comment(dto.getComment())
                .paymentMethod(parentOrder.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .pricePaid(tour.getPrice().multiply(BigDecimal.valueOf(dto.getParticipants())))
                .tourSnapshot(toJson(tour))
                .build();
    }

    // Map entity -> response DTO
    public OrderItemResponseDto toDto(OrderItem item) {
        Tour tour = item.getTour();
        return OrderItemResponseDto.builder()
                .id(item.getId())
                .tourId(item.getTour().getId())
                .shopId(item.getShopId())
                .tourTitle(item.getTourTitle())
                .tourLocation(tour.getLocation())
                .tourMeetingPoint(tour.getMeetingPoint())
                .tourImages(
                        item.getTour().getImages()
                                .stream()
                                .map(TourImage::getImageUrl)
                                .toList())
                .scheduledAt(item.getScheduledAt())
                .participants(item.getParticipants())
                .name(item.getName())
                .email(item.getEmail())
                .phone(item.getPhone())
                .sessionId(
                        Optional.ofNullable(item.getSession())
                                .map(TourSession::getId)
                                .orElse(null))
                .nationality(item.getNationality())
                .preferredLanguage(item.getPreferredLanguage())
                .comment(item.getComment())
                .pricePaid(item.getPricePaid())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .tourSnapshot(item.getTourSnapshot())
                .managerId(item.getManager() != null ? item.getManager().getId() : null)
                .managerName(item.getManager() != null ? item.getManager().getName() : null)
                .build();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize object", e);
        }
    }
}