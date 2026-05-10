package com.tourhub.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.tourhub.order.model.OrderStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private Long id;
    private BigDecimal totalPrice;
    private String paymentMethod;
    private OrderStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant expiresAt;

    private List<OrderItemResponseDto> items;
}