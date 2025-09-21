package com.example.store_manager.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.example.store_manager.model.OrderStatus;

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

    private List<OrderItemResponseDto> items;
}